import { generateJsonWithGemini } from '../lib/gemini.js';
import { buildSurveyPrompt } from '../prompts/survey.prompt.js';
import { buildReviewerPrompt } from '../prompts/reviewer.prompt.js';
import { createReview } from './review.service.js';
import { surveyRepository, fetchTargetedFiles } from './github.service.js';
import { prisma } from '../lib/prisma.js';

interface SurveyResult {
  isRelevant: boolean;
  relevanceReason: string;
  detectedTechStack: string[];
  priorityFiles: string[];
  repositorySummary: string;
}

interface ReviewResult {
  overallScore: number;
  featureCompletion: {
    featureId: string;
    featureTitle: string;
    implemented: boolean;
    details: string;
  }[];
  mentorReport: {
    strengths: string[];
    weaknesses: string[];
    criticalFixes: {
      title: string;
      description: string;
      severity: string;
      file: string;
      code: string;
      suggestion: string;
    }[];
    codeQualityScore: number;
    securityScore: number;
    performanceScore: number;
    bestPracticesScore: number;
  };
}

export async function performReview(projectId: string, repoUrl: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  const features = project.features as { id: string; title: string; description: string; priority: string }[];
  const techStack = project.techStack as string[];

  // ──────────────────────────────────────────────
  // STAGE 1: Survey — relevance gate + file triage
  // ──────────────────────────────────────────────
  console.log(`[Review] Stage 1: Surveying repository ${repoUrl}...`);

  const { tree, metadataSnapshot, allPaths } = await surveyRepository(repoUrl);

  if (allPaths.length === 0) {
    throw new Error('Repository contains no recognizable source files.');
  }

  const surveyPrompt = buildSurveyPrompt(
    {
      title: project.title,
      description: project.description,
      category: project.category,
      techStack,
    },
    metadataSnapshot,
    allPaths,
  );

  const survey = await generateJsonWithGemini<SurveyResult>(surveyPrompt);

  // Relevance gate
  if (!survey.isRelevant) {
    throw new Error(
      `Repository mismatch: ${survey.relevanceReason}. ` +
      `Detected tech: ${survey.detectedTechStack.join(', ')}. ` +
      `Expected: ${techStack.join(', ')}.`
    );
  }

  console.log(`[Review] Survey complete. ${survey.priorityFiles.length} priority files identified.`);

  // ──────────────────────────────────────────────
  // STAGE 2: Targeted ingestion — fetch priority files in parallel
  // ──────────────────────────────────────────────
  console.log(`[Review] Stage 2: Fetching priority files...`);

  // Ensure we have at least some files, fallback to first 25 paths
  const targetPaths = survey.priorityFiles.length > 0
    ? survey.priorityFiles.slice(0, 30)
    : allPaths.slice(0, 25);

  const codeSnapshot = await fetchTargetedFiles(tree, targetPaths);

  if (!codeSnapshot.trim()) {
    throw new Error('Failed to fetch any file contents from the repository.');
  }

  // ──────────────────────────────────────────────
  // STAGE 3: Deep audit — AI code review
  // ──────────────────────────────────────────────
  console.log(`[Review] Stage 3: Performing deep audit...`);

  const reviewPrompt = buildReviewerPrompt(
    {
      title: project.title,
      description: project.description,
      features,
      techStack,
    },
    codeSnapshot,
    survey.repositorySummary,
  );

  const reviewData = await generateJsonWithGemini<ReviewResult>(reviewPrompt);

  // Validate score ranges
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  reviewData.overallScore = clamp(reviewData.overallScore);
  reviewData.mentorReport.codeQualityScore = clamp(reviewData.mentorReport.codeQualityScore);
  reviewData.mentorReport.securityScore = clamp(reviewData.mentorReport.securityScore);
  reviewData.mentorReport.performanceScore = clamp(reviewData.mentorReport.performanceScore);
  reviewData.mentorReport.bestPracticesScore = clamp(reviewData.mentorReport.bestPracticesScore);

  // ──────────────────────────────────────────────
  // STAGE 4: Persist results
  // ──────────────────────────────────────────────
  console.log(`[Review] Stage 4: Saving review (score: ${reviewData.overallScore})...`);

  const review = await createReview(projectId, {
    repoUrl,
    overallScore: reviewData.overallScore,
    featureCompletion: reviewData.featureCompletion,
    mentorReport: reviewData.mentorReport,
  });

  console.log(`[Review] Complete. Review ID: ${review.id}`);
  return review;
}

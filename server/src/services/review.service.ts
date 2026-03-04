import { prisma } from '../lib/prisma.js';

export async function getReviewsByProject(projectId: string, userId: string) {
  // Verify ownership
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) {
    throw new Error('Project not found');
  }

  return prisma.review.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createReview(projectId: string, data: {
  repoUrl: string;
  overallScore: number;
  featureCompletion: unknown;
  mentorReport: unknown;
}) {
  return prisma.review.create({
    data: {
      projectId,
      repoUrl: data.repoUrl,
      overallScore: data.overallScore,
      featureCompletion: data.featureCompletion as any,
      mentorReport: data.mentorReport as any,
    },
  });
}

export function buildSurveyPrompt(
  projectBrief: {
    title: string;
    description: string;
    category: string;
    techStack: string[];
  },
  metadataSnapshot: string,
  allPaths: string[],
): string {
  return `You are an expert code reviewer preparing for a deep analysis. Your job is to SURVEY a repository before reviewing it.

## Project Requirements
**Title**: ${projectBrief.title}
**Category**: ${projectBrief.category}
**Description**: ${projectBrief.description}
**Expected Tech Stack**: ${projectBrief.techStack.join(', ')}

## Repository Metadata Files
${metadataSnapshot || '(No metadata files found)'}

## Full File Tree
${allPaths.join('\n')}

---

Analyze the repository and return ONLY valid JSON (no markdown fences):

{
  "isRelevant": true,
  "relevanceReason": "Brief explanation of why this repo matches or doesn't match the project requirements",
  "detectedTechStack": ["React", "TypeScript", "etc"],
  "priorityFiles": [
    "src/services/auth.ts",
    "src/components/App.tsx"
  ],
  "repositorySummary": "One paragraph summary of what this repo appears to be"
}

Rules:
- **isRelevant**: false if the repo's tech stack or purpose fundamentally doesn't match the project requirements (e.g., Python repo for a React project, or a calculator app for a chat app project). Be lenient — partial matches are still relevant.
- **priorityFiles**: Select 20-30 files that contain CORE BUSINESS LOGIC. Prioritize:
  1. Route handlers, controllers, services, API endpoints
  2. React components with state/logic (not pure UI)
  3. Database models, schemas, migrations
  4. Utility functions with business logic
  5. Test files for core features
  - DEPRIORITIZE: config files, style files, boilerplate, lock files, pure type definitions
- **detectedTechStack**: List technologies you can identify from package.json, imports, file extensions
- Order priorityFiles from most important to least important`;
}

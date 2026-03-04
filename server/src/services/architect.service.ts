import { generateJsonWithGemini } from '../lib/gemini.js';
import { buildArchitectPrompt } from '../prompts/architect.prompt.js';
import { createProject } from './project.service.js';

interface GeneratedProject {
  title: string;
  description: string;
  category: string;
  prd: string;
  techStack: string[];
  features: { id: string; title: string; description: string; priority: string }[];
}

export async function generateProject(userId: string, category: string) {
  const prompt = buildArchitectPrompt(category);
  const data = await generateJsonWithGemini<GeneratedProject>(prompt);

  const project = await createProject(userId, {
    title: data.title,
    description: data.description,
    category: data.category || category,
    prd: data.prd,
    techStack: data.techStack,
    features: data.features,
  });

  return project;
}

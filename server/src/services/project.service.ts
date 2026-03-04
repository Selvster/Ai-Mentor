import { prisma } from '../lib/prisma.js';

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) {
    throw new Error('Project not found');
  }
  return project;
}

export async function createProject(userId: string, data: {
  title: string;
  description: string;
  category: string;
  prd: string;
  techStack: string[];
  features: { id: string; title: string; description: string; priority: string }[];
}) {
  return prisma.project.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      prd: data.prd,
      techStack: data.techStack,
      features: data.features,
    },
  });
}

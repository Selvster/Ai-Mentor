import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { getUserProjects, getProjectById } from '../services/project.service.js';
import { generateProject } from '../services/architect.service.js';

const router = Router();

router.use(authMiddleware as any);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await getUserProjects(req.user!.userId);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await getProjectById(req.params.id as string, req.user!.userId);
    res.json(project);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.body;
    if (!category) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }
    const project = await generateProject(req.user!.userId, category);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

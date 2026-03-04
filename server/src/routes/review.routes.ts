import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { getReviewsByProject } from '../services/review.service.js';
import { performReview } from '../services/reviewer.service.js';
import { getProjectById } from '../services/project.service.js';

const router = Router();

router.use(authMiddleware as any);

router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await getReviewsByProject(req.params.projectId as string, req.user!.userId);
    res.json(reviews);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reviews';
    res.status(404).json({ error: message });
  }
});

router.post('/submit', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, repoUrl } = req.body;
    if (!projectId || !repoUrl) {
      res.status(400).json({ error: 'projectId and repoUrl are required' });
      return;
    }

    // Validate GitHub URL format
    if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(repoUrl)) {
      res.status(400).json({ error: 'Invalid GitHub URL format' });
      return;
    }

    // Verify project ownership
    await getProjectById(projectId, req.user!.userId);

    // Multi-stage AI review (survey → targeted fetch → deep audit → persist)
    const review = await performReview(projectId, repoUrl);

    res.status(201).json(review);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review failed';
    // Use 422 for relevance mismatches, 500 for everything else
    const status = message.includes('mismatch') || message.includes('empty') ? 422 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;

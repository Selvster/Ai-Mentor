import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Review } from '../types';

export function useReviews(projectId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.reviews.getByProject(projectId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submit = async (repoUrl: string) => {
    const review = await api.reviews.submit(projectId, repoUrl);
    setReviews((prev) => [review, ...prev]);
    return review;
  };

  return { reviews, loading, error, submit, refetch: fetchReviews };
}

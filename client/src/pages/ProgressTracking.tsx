import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { FeatureVerificationList } from '../components/FeatureChecklist';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { FeatureVerification } from '../types';
import { useReviews } from '../hooks/useReviews';
import { useProject } from '../hooks/useProjects';

export function ProgressTracking() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProject(projectId!);
  const { reviews, loading } = useReviews(projectId!);
  const review = reviews[0];

  if (loading) return <LoadingSpinner message="Loading progress..." />;

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Project not found</h2>
        <Link to="/" className="text-indigo-600 mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  if (!review) {
    return (
      <div>
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-gray-900">No progress data yet</h2>
          <p className="text-gray-500 mt-1">Submit your code for review to track feature progress.</p>
        </div>
      </div>
    );
  }

  const featureCompletion = (review.featureCompletion as FeatureVerification[]) || [];
  const implemented = featureCompletion.filter((f) => f.implemented).length;
  const total = featureCompletion.length;
  const percentage = total > 0 ? Math.round((implemented / total) * 100) : 0;

  return (
    <div>
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Progress: {project.title}</h1>
        <p className="text-gray-500 mt-1">Track your feature implementation progress</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
        <p className="text-sm text-gray-500">
          {implemented} of {total} features implemented
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Breakdown</h2>
        <FeatureVerificationList verifications={featureCompletion} />
      </div>
    </div>
  );
}

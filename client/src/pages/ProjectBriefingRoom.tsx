import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, FileText, Layers, ListChecks, Rocket } from 'lucide-react';
import { FeatureChecklist } from '../components/FeatureChecklist';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useProject } from '../hooks/useProjects';
import { useReviews } from '../hooks/useReviews';
import type { Feature } from '../types';

export function ProjectBriefingRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, loading, error } = useProject(id!);
  const { submit } = useReviews(id!);
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingSpinner message="Loading project..." />;
  if (error || !project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Project not found</h2>
        <Link to="/" className="text-indigo-600 mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const features = (project.features as Feature[]) || [];
  const techStack = (project.techStack as string[]) || [];

  const handleSubmit = async () => {
    if (!repoUrl.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submit(repoUrl);
      navigate(`/reviews/${project.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
        <p className="text-gray-500 mt-1">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Project Requirements</h2>
            </div>
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
              {project.prd}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Features to Implement</h2>
            </div>
            <FeatureChecklist features={features} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Submit for Review</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter your GitHub repository URL to get an AI-powered code review.
            </p>
            {submitError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-3">{submitError}</div>
            )}
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            />
            <button
              onClick={handleSubmit}
              disabled={!repoUrl.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Analyzing repository...' : 'Submit for Review'}
            </button>
          </section>

          <div className="space-y-2">
            <Link
              to={`/reviews/${project.id}`}
              className="block text-center text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 rounded-lg py-2.5"
            >
              View Reviews
            </Link>
            <Link
              to={`/progress/${project.id}`}
              className="block text-center text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 rounded-lg py-2.5"
            >
              Track Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

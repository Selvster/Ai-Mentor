import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ReviewScoreCard } from '../components/ReviewScoreCard';
import { CodeBlock } from '../components/CodeBlock';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { MentorReport, CriticalFix } from '../types';
import { useReviews } from '../hooks/useReviews';
import { useProject } from '../hooks/useProjects';

export function MentorDesk() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProject(projectId!);
  const { reviews, loading, error } = useReviews(projectId!);
  const review = reviews[0];

  if (loading) return <LoadingSpinner message="Loading review..." />;

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Project not found</h2>
        <Link to="/" className="text-indigo-600 mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div>
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-gray-900">No reviews yet</h2>
          <p className="text-gray-500 mt-1">Submit your repository for an AI-powered code review.</p>
          <Link to={`/projects/${projectId}`} className="inline-block mt-4 text-indigo-600 font-medium">
            Go to Project
          </Link>
        </div>
      </div>
    );
  }

  const mentorReport = review.mentorReport as MentorReport;

  return (
    <div>
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Code Review: {project.title}</h1>
        <p className="text-gray-500 mt-1">AI-powered analysis of your codebase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ReviewScoreCard overallScore={review.overallScore} report={mentorReport} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {mentorReport.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Weaknesses</h2>
            </div>
            <ul className="space-y-2">
              {mentorReport.weaknesses?.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Critical Fixes
          </h2>
          {mentorReport.criticalFixes?.map((fix: CriticalFix, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{fix.title}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  fix.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {fix.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">File:</span> {fix.file}
              </p>
              <p className="text-sm text-gray-600 mb-4">{fix.description}</p>
              <div className="space-y-3">
                <CodeBlock code={fix.code} title="Current Code" variant="danger" />
                <CodeBlock code={fix.suggestion} title="Suggested Fix" variant="success" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

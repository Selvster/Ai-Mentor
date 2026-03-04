import type { MentorReport } from '../types';

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div className={`rounded-lg border p-4 text-center ${getScoreColor(score)}`}>
      <div className="text-3xl font-bold">{score}</div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </div>
  );
}

export function ReviewScoreCard({ overallScore, report }: { overallScore: number; report: MentorReport }) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border-2 p-6 text-center ${getScoreColor(overallScore)}`}>
        <div className="text-5xl font-bold">{overallScore}</div>
        <div className="text-sm font-medium mt-2">Overall Score</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ScoreBadge label="Code Quality" score={report.codeQualityScore} />
        <ScoreBadge label="Security" score={report.securityScore} />
        <ScoreBadge label="Performance" score={report.performanceScore} />
        <ScoreBadge label="Best Practices" score={report.bestPracticesScore} />
      </div>
    </div>
  );
}

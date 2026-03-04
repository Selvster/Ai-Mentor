import { Link } from 'react-router-dom';
import { FolderOpen, Clock } from 'lucide-react';
import type { Project } from '../types';

const categoryColors: Record<string, string> = {
  'Full-Stack': 'bg-purple-100 text-purple-700',
  'Backend': 'bg-green-100 text-green-700',
  'Frontend': 'bg-blue-100 text-blue-700',
  'DevOps': 'bg-orange-100 text-orange-700',
  'Mobile': 'bg-pink-100 text-pink-700',
  'AI/ML': 'bg-cyan-100 text-cyan-700',
  'Data Engineering': 'bg-amber-100 text-amber-700',
  'CLI Tool': 'bg-slate-100 text-slate-700',
  'API Design': 'bg-teal-100 text-teal-700',
  'Game Dev': 'bg-rose-100 text-rose-700',
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <FolderOpen className="h-5 w-5 text-indigo-600" />
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[project.category] || 'bg-gray-100 text-gray-700'}`}>
          {project.category}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      <div className="flex items-center text-xs text-gray-400">
        <Clock className="h-3.5 w-3.5 mr-1" />
        {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useProjects } from '../hooks/useProjects';

const categories = ['Full-Stack', 'Backend', 'Frontend', 'DevOps', 'Mobile', 'AI/ML', 'Data Engineering', 'CLI Tool', 'API Design', 'Game Dev'];

export function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { projects, loading, error, generate } = useProjects();

  const handleGenerate = async (category: string) => {
    setShowDropdown(false);
    setGenerating(true);
    try {
      await generate(category);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate project');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
          <p className="text-gray-500 mt-1">AI-generated project briefs for your coding journey</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={generating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate New Project'}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleGenerate(cat)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">{error}</div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500">Generate your first AI-powered project brief to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

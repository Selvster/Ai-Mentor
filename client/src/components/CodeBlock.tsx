interface CodeBlockProps {
  code: string;
  title?: string;
  variant?: 'danger' | 'success' | 'neutral';
}

const variantStyles = {
  danger: 'border-red-200 bg-red-950',
  success: 'border-green-200 bg-green-950',
  neutral: 'border-gray-200 bg-gray-900',
};

const headerStyles = {
  danger: 'bg-red-900/50 text-red-300',
  success: 'bg-green-900/50 text-green-300',
  neutral: 'bg-gray-800 text-gray-300',
};

export function CodeBlock({ code, title, variant = 'neutral' }: CodeBlockProps) {
  return (
    <div className={`rounded-lg border overflow-hidden ${variantStyles[variant]}`}>
      {title && (
        <div className={`px-4 py-2 text-xs font-medium ${headerStyles[variant]}`}>
          {title}
        </div>
      )}
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

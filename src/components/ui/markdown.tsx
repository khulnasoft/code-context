import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface MarkdownProps {
  contents: string;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Markdown: React.FC<MarkdownProps> = ({ contents }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: ({ ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-xl font-medium mt-5 mb-2 text-foreground" {...props} />
        ),
        p: ({ ...props }) => (
          <p className="mb-4 leading-relaxed text-foreground" {...props} />
        ),
        ul: ({ ...props }) => (
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground" {...props} />
        ),
        li: ({ ...props }) => <li className="mb-1 text-foreground" {...props} />,
        blockquote: ({ ...props }) => (
          <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 italic text-foreground" {...props} />
        ),
        a: ({ ...props }) => (
          <a className="text-primary hover:underline" {...props} />
        ),
        code: ({ inline, className, children, ...props }: CodeProps) => {
          const match = /language-(\w+)/.exec(className || '');
          if (!inline && match) {
            return (
              <pre className="bg-muted p-4 rounded-md my-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          } else {
            return (
              <code className="bg-muted text-foreground px-1 py-0.5 rounded-md text-sm" {...props}>
                {children}
              </code>
            );
          }
        },
        table: ({ ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-border" {...props} />
          </div>
        ),
        th: ({ ...props }) => (
          <th className="px-3 py-2 bg-muted font-semibold text-left text-foreground" {...props} />
        ),
        td: ({ ...props }) => (
          <td className="px-3 py-2 border-t border-border text-foreground" {...props} />
        ),
      }}
    >
      {contents}
    </ReactMarkdown>
  );
};

export default Markdown;
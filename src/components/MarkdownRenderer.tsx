import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse markdown lines for headers, bullet points, and paragraphs
  const lines = content.split('\n');

  const renderFormattedText = (text: string) => {
    // Process bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-charcoal dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Process italic (*text*)
      const subParts = part.split(/(\*.*?\*)/g);
      return subParts.map((subPart, j) => {
        if (subPart.startsWith('*') && subPart.endsWith('*') && !subPart.startsWith('**')) {
          return (
            <em key={`${i}-${j}`} className="italic text-steel dark:text-zinc-300">
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet point: * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">{renderFormattedText(itemText)}</div>
            </div>
          );
        }

        // Sub-bullet point: * **Field:**
        if (trimmed.startsWith('*   ') || trimmed.startsWith('-   ')) {
          const itemText = trimmed.slice(4);
          return (
            <div key={idx} className="flex items-start gap-2 pl-3 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">{renderFormattedText(itemText)}</div>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-semibold text-sm text-charcoal dark:text-white mt-2 mb-1">
              {renderFormattedText(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-semibold text-sm text-charcoal dark:text-white mt-2.5 mb-1">
              {renderFormattedText(trimmed.slice(3))}
            </h3>
          );
        }

        return (
          <p key={idx} className="text-charcoal dark:text-zinc-100">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );
};

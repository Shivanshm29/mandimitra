import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-1.5 pl-4 space-y-1 list-disc text-inherit marker:text-emerald-700">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-1.5 pl-4 space-y-1 list-decimal text-inherit marker:text-emerald-700">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const renderInline = (text: string): React.ReactNode[] => {
    // Replace **bold**, *italic*, `code`, ₹ currency
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    parts.forEach((part, i) => {
      if (!part) return;
      if (part.startsWith('**') && part.endsWith('**')) {
        tokens.push(
          <strong key={i} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        tokens.push(
          <em key={i} className="italic text-gray-800">
            {part.slice(1, -1)}
          </em>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        tokens.push(
          <code key={i} className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[11px] text-emerald-800 font-semibold border border-gray-200">
            {part.slice(1, -1)}
          </code>
        );
      } else {
        tokens.push(part);
      }
    });

    return tokens;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${index}`} className="h-1.5" />);
      return;
    }

    // Heading 3: ### Heading
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${index}`} className="text-sm font-bold text-emerald-900 mt-2 mb-1 tracking-tight">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Heading 2: ## Heading
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${index}`} className="text-sm font-extrabold text-emerald-950 mt-2.5 mb-1 tracking-tight">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Heading 1: # Heading
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${index}`} className="text-base font-extrabold text-emerald-950 mt-3 mb-1.5 tracking-tight">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Bullet List: - item, * item, • item
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInline(bulletMatch[1]));
      return;
    }

    // Numbered List: 1. item
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInline(numMatch[1]));
      return;
    }

    // Blockquote: > quote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${index}`} className="border-l-3 border-emerald-600 pl-3 py-1 my-1.5 text-xs text-gray-700 italic bg-emerald-50/50 rounded-r-lg">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Regular line / Paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed my-0.5">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`text-xs sm:text-sm text-gray-800 ${className}`}>{elements}</div>;
};

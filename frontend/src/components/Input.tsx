import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  optional = false,
  className = '',
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="text-sm font-semibold text-charcoal-800">
            {label}
          </label>
          {optional && (
            <span className="text-xs text-charcoal-700 font-normal">ऐच्छिक / Optional</span>
          )}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-charcoal-900 text-base shadow-sm focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-warm-400 focus:border-forest-600 focus:ring-forest-100'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-charcoal-700">{helperText}</p>}
    </div>
  );
};


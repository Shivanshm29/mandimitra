import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-5 py-2.5 text-base min-h-[48px]', // Mobile-first comfortable touch target
    lg: 'px-6 py-3.5 text-lg min-h-[54px]',
  };

  const variantClasses = {
    primary: 'bg-forest-600 hover:bg-forest-700 text-white shadow-sm focus:ring-forest-600 active:bg-forest-800',
    secondary: 'bg-warm-300 hover:bg-warm-400 text-charcoal-900 focus:ring-warm-400',
    accent: 'bg-mustard-500 hover:bg-mustard-600 text-charcoal-900 font-semibold shadow-sm focus:ring-mustard-500',
    outline: 'border-2 border-forest-600 text-forest-600 hover:bg-forest-50 focus:ring-forest-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};


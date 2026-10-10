import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ label, error, helperText, className, id, ...props }, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  
  return (
    <div className="w-full font-inter">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-raahx-navy mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={twMerge(
          clsx(
            'block w-full rounded-md border-raahx-border shadow-sm transition-all duration-200',
            'hover:border-gray-300 focus:ring-1 focus:ring-raahx-orange focus:border-raahx-orange focus:outline-none',
            'sm:text-sm px-4 py-2 border bg-white text-raahx-navy placeholder-gray-400',
            { 'border-red-500 focus:ring-red-500 focus:border-red-500': error },
            { 'opacity-50 cursor-not-allowed hover:border-raahx-border': props.disabled },
            className
          )
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 animate-in slide-in-from-top-1 fade-in">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-raahx-slate">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

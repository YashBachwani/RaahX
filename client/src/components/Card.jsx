import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div className={twMerge(clsx('bg-white rounded-xl shadow-sm border border-raahx-border overflow-hidden', className))} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className }) => {
  return (
    <div className={twMerge(clsx('px-6 py-4 border-b border-raahx-border flex justify-between items-center bg-white', className))}>
      <div>
        {title && <h3 className="text-lg font-semibold text-raahx-navy font-inter">{title}</h3>}
        {subtitle && <p className="text-sm text-raahx-slate mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={twMerge(clsx('p-6 bg-white', className))}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className }) => {
  return (
    <div className={twMerge(clsx('px-6 py-4 border-t border-raahx-border bg-gray-50', className))}>
      {children}
    </div>
  );
};

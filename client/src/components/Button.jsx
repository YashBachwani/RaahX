import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-inter font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-raahx-orange text-white shadow-sm hover:bg-[#E56000] focus:ring-raahx-orange border border-transparent',
    secondary: 'bg-white text-raahx-navy border border-raahx-border shadow-sm hover:bg-gray-50 focus:ring-raahx-slate',
    ghost: 'bg-transparent text-raahx-slate hover:text-raahx-navy hover:bg-gray-50 focus:ring-raahx-slate',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    icon: 'p-2',
  };

  const classes = twMerge(clsx(baseStyles, variants[variant], sizes[size], className));

  return (
    <button className={classes} {...props}>
      {icon && <span className={clsx('mr-2', { 'mr-0': size === 'icon' })}>{icon}</span>}
      {size !== 'icon' && children}
    </button>
  );
};

export default Button;

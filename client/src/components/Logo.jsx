import React from 'react';

const Logo = ({ className = '', variant = 'full', size = 'md' }) => {
  // size map
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };
  const heightClass = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="RaahX Logo" 
        className={`${heightClass} w-auto object-contain`}
        onError={(e) => {
          // Fallback if logo.png is not found
          e.target.onerror = null; 
          e.target.src = "data:image/svg+xml,%3Csvg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 80 L45 20 L75 20 C85 20 90 25 90 35 C90 45 85 50 75 50 L55 50 L65 80 L45 80 L35 50 L30 80 Z' fill='%23FF6B00'/%3E%3Cpath d='M20 90 L40 30 L55 30 L35 90 Z' fill='%230ECAD4'/%3E%3C/svg%3E";
        }}
      />
    </div>
  );
};

export default Logo;

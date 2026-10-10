import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertTriangle, AlertCircle, WifiOff } from 'lucide-react';

const StatusBadge = ({ status, text, className }) => {
  const variants = {
    'on-time': 'bg-green-50 text-green-700 border-green-200',
    'delayed': 'bg-amber-50 text-amber-700 border-amber-200',
    'crowded': 'bg-red-50 text-red-700 border-red-200',
    'offline': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const icons = {
    'on-time': <CheckCircle2 size={14} className="mr-1.5" />,
    'delayed': <AlertTriangle size={14} className="mr-1.5" />,
    'crowded': <AlertCircle size={14} className="mr-1.5" />,
    'offline': <WifiOff size={14} className="mr-1.5" />,
  };

  const activeVariant = variants[status] || variants['offline'];
  const activeIcon = icons[status] || icons['offline'];

  return (
    <span className={twMerge(clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border font-inter', activeVariant, className))}>
      {activeIcon}
      {text || status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;

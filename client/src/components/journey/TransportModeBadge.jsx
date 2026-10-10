import React from 'react';
import { Train, Bus, PersonStanding, Activity } from 'lucide-react';

export const ModeIcon = ({ mode, size = 16, className = '' }) => {
  if (mode === 'Metro') return <Train size={size} className={`text-raahx-cyan ${className}`} />;
  if (mode === 'BRTS') return <Bus size={size} className={`text-raahx-orange ${className}`} />;
  if (mode === 'AMTS') return <Bus size={size} className={`text-red-500 ${className}`} />;
  if (mode === 'Walk') return <PersonStanding size={size} className={`text-gray-500 ${className}`} />;
  return <Activity size={size} className={className} />;
};

const TransportModeBadge = ({ mode, showLabel = true, className = '' }) => {
  return (
    <span className={`inline-flex items-center bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 ${className}`}>
      <ModeIcon mode={mode} size={12} className={showLabel ? "mr-1" : ""} />
      {showLabel && mode}
    </span>
  );
};

export default TransportModeBadge;

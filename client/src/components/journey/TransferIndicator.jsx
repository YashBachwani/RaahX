import React from 'react';

const TransferIndicator = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
      {count} transfer{count !== 1 && 's'}
    </span>
  );
};

export default TransferIndicator;

import React from 'react';
import TransportModeBadge from './TransportModeBadge';

const RouteResultCard = ({ route, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'border-raahx-navy bg-blue-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-raahx-cyan hover:bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
         <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
           route.profile === 'BEST_OVERALL' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
         }`}>
           {route.profileDetails.name}
         </span>
         <span className="font-bold text-lg text-raahx-navy">{route.duration} min</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {route.modesUsed.map((m, i) => (
          <TransportModeBadge key={i} mode={m} />
        ))}
      </div>
      <div className="text-xs text-gray-500 flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
         <span>{route.transfers} transfer{route.transfers !== 1 && 's'}</span>
         <span className="font-semibold text-gray-700">
            {route.fareUnknown ? 'Fare unknown' : `₹${route.fare}`}
         </span>
      </div>
    </div>
  );
};

export default RouteResultCard;

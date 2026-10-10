import React from 'react';
import { ModeIcon } from './TransportModeBadge';

const JourneyStepList = ({ legs, destination }) => {
  return (
    <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
      {legs.map((leg, i) => (
        <div key={i} className="relative">
          {/* Node dot */}
          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${
            leg.mode === 'Walk' ? 'bg-gray-300' : 
            leg.mode === 'Metro' ? 'bg-raahx-cyan' : 
            leg.mode === 'BRTS' ? 'bg-raahx-orange' : 'bg-red-500'
          }`}></div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
             <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                   <ModeIcon mode={leg.mode} size={18} className="mr-2" />
                   <span className="font-bold text-raahx-navy">
                      {leg.mode === 'Walk' ? 'Walk' : `Board ${leg.mode} (${leg.routeId})`}
                   </span>
                </div>
                <span className="text-sm font-bold text-gray-600">{leg.duration} min</span>
             </div>
             
             <div className="ml-6 space-y-1 mt-3">
                <div className="flex items-center text-sm text-gray-700">
                   <span className="w-16 font-semibold text-gray-500 text-xs uppercase">From</span> 
                   <span className="font-medium text-raahx-navy">{leg.fromName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                   <span className="w-16 font-semibold text-gray-500 text-xs uppercase">To</span> 
                   <span className="font-medium text-raahx-navy">{leg.toName}</span>
                </div>
                {leg.mode !== 'Walk' && (
                   <div className="flex items-center text-sm text-gray-700 pt-1">
                      <span className="w-16 font-semibold text-gray-500 text-xs uppercase">Fare</span> 
                      <span>{leg.fareUnknown ? 'Unknown' : `₹${leg.fare}`}</span>
                   </div>
                )}
             </div>
          </div>
        </div>
      ))}
      
      {/* Final Destination Node */}
      <div className="relative">
        <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
        <h4 className="font-bold text-raahx-navy text-lg pt-0.5">Arrive at {destination}</h4>
      </div>
    </div>
  );
};

export default JourneyStepList;

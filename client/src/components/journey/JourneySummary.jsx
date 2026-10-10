import React from 'react';
import { Clock, Info, ArrowRight } from 'lucide-react';

const JourneySummary = ({ origin, destination, route }) => {
  return (
    <div className="p-6 border-b border-gray-100 bg-raahx-navy text-white rounded-t-lg">
      <h3 className="text-xl font-bold flex items-center mb-2">
         {origin} <ArrowRight size={18} className="mx-2 text-raahx-cyan" /> {destination}
      </h3>
      <p className="text-raahx-slate text-sm flex items-center">
         <Clock size={14} className="mr-1.5" /> Total Time: <strong className="ml-1 text-white">{route.duration} mins</strong>
         <span className="mx-3 border-l border-gray-600 h-4"></span>
         Fare: <strong className="ml-1 text-white">{route.fareUnknown ? 'Estimate unavailable' : `₹${route.fare}`}</strong>
      </p>
      <p className="text-raahx-cyan text-xs mt-3 flex items-start bg-blue-900/30 p-2 rounded">
         <Info size={14} className="mr-1.5 shrink-0 mt-0.5" />
         {route.profileDetails.description}
      </p>
    </div>
  );
};

export default JourneySummary;

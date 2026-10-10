import React from 'react';
import { Navigation } from 'lucide-react';

const JourneyEmptyState = () => {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center p-8">
       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 text-raahx-slate">
          <Navigation size={28} />
       </div>
       <h3 className="text-xl font-bold text-raahx-navy mb-2">Where to next?</h3>
       <p className="text-raahx-slate max-w-md">Enter your starting point and destination on the left to explore multimodal journeys across the synthetic network.</p>
    </div>
  );
};

export default JourneyEmptyState;

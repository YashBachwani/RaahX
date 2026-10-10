import React from 'react';
import JourneyStepList from './JourneyStepList';

const SchematicNetwork = ({ route, destination }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-6">
         <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Schematic Route Itinerary</h4>
         <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Schematic Map (Not Geographic)</span>
      </div>
      
      <JourneyStepList legs={route.legs} destination={destination} />
    </div>
  );
};

export default SchematicNetwork;

import React, { useState } from 'react';
import { syntheticStops } from '../data/syntheticTransportNetwork';
import { searchJourneys } from '../services/routePlanner';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { MapPin, Navigation, ArrowRight, Train, Bus, Activity, Clock, Info, ShieldAlert, ArrowUpDown, PersonStanding } from 'lucide-react';
import Logo from '../components/Logo';

const ModeIcon = ({ mode, size = 16, className = '' }) => {
  if (mode === 'Metro') return <Train size={size} className={`text-raahx-cyan ${className}`} />;
  if (mode === 'BRTS') return <Bus size={size} className={`text-raahx-orange ${className}`} />;
  if (mode === 'AMTS') return <Bus size={size} className={`text-red-500 ${className}`} />;
  if (mode === 'Walk') return <PersonStanding size={size} className={`text-gray-500 ${className}`} />;
  return <Activity size={size} className={className} />;
};

const JourneyPlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const handleSearch = () => {
    setError(null);
    setResults(null);
    
    if (!origin || !destination) {
      setError('Please enter both origin and destination.');
      return;
    }
    
    const origStop = syntheticStops.find(s => s.name.toLowerCase() === origin.toLowerCase() || s.id === origin);
    const destStop = syntheticStops.find(s => s.name.toLowerCase() === destination.toLowerCase() || s.id === destination);
    
    if (!origStop) {
      setError(`Origin stop "${origin}" not found in the network.`);
      return;
    }
    if (!destStop) {
      setError(`Destination stop "${destination}" not found in the network.`);
      return;
    }
    if (origStop.id === destStop.id) {
      setError('Origin and destination cannot be the same.');
      return;
    }

    const routes = searchJourneys(origStop.id, destStop.id);
    if (routes.length === 0) {
      setError('No valid routes found between these locations.');
      return;
    }

    setResults(routes);
    setSelectedRouteIdx(0);
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const clearSearch = () => {
    setOrigin('');
    setDestination('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-inter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-raahx-navy tracking-tight">Journey Planner</h1>
          <p className="text-raahx-slate mt-1">Every Route. One Smarter Journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search Form & Result Cards */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-raahx-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-raahx-navy mb-4 flex items-center">
                <Navigation size={18} className="mr-2 text-raahx-orange" /> Plan a Journey
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                   <label className="block text-xs font-semibold text-raahx-slate uppercase tracking-wider mb-1">Origin</label>
                   <input 
                     type="text" 
                     className="w-full border border-gray-300 rounded-md p-2 pl-9 text-sm focus:ring-1 focus:ring-raahx-cyan outline-none"
                     placeholder="e.g. Kalupur Railway Station"
                     value={origin}
                     onChange={e => setOrigin(e.target.value)}
                     list="stopsList"
                   />
                   <MapPin size={16} className="absolute left-3 top-[26px] text-gray-400" />
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                   <button onClick={handleSwap} className="bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 text-raahx-navy">
                      <ArrowUpDown size={14} />
                   </button>
                </div>
                
                <div className="relative">
                   <label className="block text-xs font-semibold text-raahx-slate uppercase tracking-wider mb-1">Destination</label>
                   <input 
                     type="text" 
                     className="w-full border border-gray-300 rounded-md p-2 pl-9 text-sm focus:ring-1 focus:ring-raahx-cyan outline-none"
                     placeholder="e.g. Shivranjani Crossroads"
                     value={destination}
                     onChange={e => setDestination(e.target.value)}
                     list="stopsList"
                   />
                   <MapPin size={16} className="absolute left-3 top-[26px] text-raahx-orange" />
                </div>

                <datalist id="stopsList">
                  {syntheticStops.map(s => <option key={s.id} value={s.name} />)}
                </datalist>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-700 mt-2 text-sm">
                    <ShieldAlert className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSearch} className="flex-1" icon={<Navigation size={16} />}>Search</Button>
                  <Button onClick={clearSearch} variant="secondary" className="px-4">Clear</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternatives List */}
          {results && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-raahx-navy uppercase tracking-wider mb-2">Suggested Routes</h4>
              {results.map((route, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedRouteIdx === idx ? 'border-raahx-navy bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-raahx-cyan hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                     <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${route.profile === 'BEST_OVERALL' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                       {route.profileDetails.name}
                     </span>
                     <span className="font-bold text-lg text-raahx-navy">{route.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {route.modesUsed.map((m, i) => (
                      <span key={i} className="inline-flex items-center bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700">
                        <ModeIcon mode={m} size={12} className="mr-1" /> {m}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                     <span>{route.transfers} transfer{route.transfers !== 1 && 's'}</span>
                     <span className="font-semibold text-gray-700">
                        {route.fareUnknown ? 'Fare unknown' : `₹${route.fare}`}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              <Card className="border-raahx-border shadow-sm">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-100 bg-raahx-navy text-white rounded-t-lg">
                    <h3 className="text-xl font-bold flex items-center mb-2">
                       {origin} <ArrowRight size={18} className="mx-2 text-raahx-cyan" /> {destination}
                    </h3>
                    <p className="text-raahx-slate text-sm flex items-center">
                       <Clock size={14} className="mr-1.5" /> Total Time: <strong className="ml-1 text-white">{results[selectedRouteIdx].duration} mins</strong>
                       <span className="mx-3 border-l border-gray-600 h-4"></span>
                       Fare: <strong className="ml-1 text-white">{results[selectedRouteIdx].fareUnknown ? 'Estimate unavailable' : `₹${results[selectedRouteIdx].fare}`}</strong>
                    </p>
                    <p className="text-raahx-cyan text-xs mt-3 flex items-start bg-blue-900/30 p-2 rounded">
                       <Info size={14} className="mr-1.5 shrink-0 mt-0.5" />
                       {results[selectedRouteIdx].profileDetails.description}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-end mb-6">
                       <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Schematic Route Itinerary</h4>
                       <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Schematic Map (Not Geographic)</span>
                    </div>
                    
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
                      {results[selectedRouteIdx].legs.map((leg, i) => (
                        <div key={i} className="relative">
                          {/* Node dot */}
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${leg.mode === 'Walk' ? 'bg-gray-300' : leg.mode === 'Metro' ? 'bg-raahx-cyan' : leg.mode === 'BRTS' ? 'bg-raahx-orange' : 'bg-red-500'}`}></div>
                          
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
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start">
                 <ShieldAlert size={16} className="mr-2 shrink-0" />
                 <p><strong>Note:</strong> This journey planner operates on a synthetic demonstration network designed for the hackathon MVP. Locations, travel times, fares, and available routes do not reflect the live operational status of the Ahmedabad transport network.</p>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center p-8">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 text-raahx-slate">
                  <Navigation size={28} />
               </div>
               <h3 className="text-xl font-bold text-raahx-navy mb-2">Where to next?</h3>
               <p className="text-raahx-slate max-w-md">Enter your starting point and destination on the left to explore multimodal journeys across the synthetic network.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyPlanner;

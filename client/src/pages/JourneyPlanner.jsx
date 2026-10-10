import React, { useState } from 'react';
import { searchJourneys, syntheticStops } from '../services/routePlanner';
import { Card, CardContent } from '../components/Card';
import { ShieldAlert } from 'lucide-react';
import JourneySearchForm from '../components/journey/JourneySearchForm';
import RouteResultCard from '../components/journey/RouteResultCard';
import JourneySummary from '../components/journey/JourneySummary';
import SchematicNetwork from '../components/journey/SchematicNetwork';
import JourneyEmptyState from '../components/journey/JourneyEmptyState';

const JourneyPlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const handleSearch = () => {
    setError(null);
    setResults(null);
    setLoading(true);
    
    if (!origin || !destination) {
      setError('Please enter both origin and destination.');
      setLoading(false);
      return;
    }
    
    const resolveStop = (input) => {
      const searchStr = input.trim().toLowerCase();
      // Find all matches
      const matches = syntheticStops.filter(s => 
        s.id === input.trim() || 
        s.name.toLowerCase() === searchStr || 
        (s.aliases && s.aliases.some(a => a.toLowerCase() === searchStr))
      );
      if (matches.length === 0) return null;
      // Prioritize METRO over AMTS if multiple match (e.g. "Thaltej Metro Station")
      const metroMatch = matches.find(s => s.agency === 'METRO');
      return metroMatch || matches[0];
    };
    
    const origStop = resolveStop(origin);
    const destStop = resolveStop(destination);
    
    if (!origStop) {
      setError(`Origin stop "${origin}" not found in the network.`);
      setLoading(false);
      return;
    }
    if (!destStop) {
      setError(`Destination stop "${destination}" not found in the network.`);
      setLoading(false);
      return;
    }
    if (origStop.id === destStop.id) {
      setError('Origin and destination cannot be the same.');
      setLoading(false);
      return;
    }

    // Allow UI to paint the loading state before synchronous intensive calculation
    setTimeout(() => {
      try {
        const routes = searchJourneys(origStop.id, destStop.id);
        if (routes.length === 0) {
          setError('No valid routes found between these locations.');
        } else {
          setResults(routes);
          setSelectedRouteIdx(0);
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while calculating the route.');
      } finally {
        setLoading(false);
      }
    }, 50);
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
    setLoading(false);
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
          <JourneySearchForm 
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            onSearch={handleSearch}
            onClear={clearSearch}
            onSwap={handleSwap}
            error={error}
            stops={syntheticStops}
            loading={loading}
          />

          {/* Alternatives List */}
          {results && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-raahx-navy uppercase tracking-wider mb-2">Suggested Routes</h4>
              {results.map((route, idx) => (
                <RouteResultCard 
                  key={idx} 
                  route={route} 
                  isSelected={selectedRouteIdx === idx} 
                  onClick={() => setSelectedRouteIdx(idx)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <Card className="border-raahx-border shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raahx-navy mb-4"></div>
              <p className="text-raahx-navy font-medium">Calculating optimal routes...</p>
              <p className="text-sm text-gray-500 mt-2">Searching through thousands of possible connections.</p>
            </Card>
          ) : results ? (
            <>
              <Card className="border-raahx-border shadow-sm">
                <CardContent className="p-0">
                  <JourneySummary origin={origin} destination={destination} route={results[selectedRouteIdx]} />
                  <SchematicNetwork route={results[selectedRouteIdx]} destination={destination} />
                </CardContent>
              </Card>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start">
                 <ShieldAlert size={16} className="mr-2 shrink-0" />
                 <p><strong>Note:</strong> This journey planner operates on a synthetic demonstration network designed for the hackathon MVP. Locations, travel times, fares, and available routes do not reflect the live operational status of the Ahmedabad transport network.</p>
              </div>
            </>
          ) : error ? (
            <Card className="border-red-200 shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center bg-red-50/30">
              <ShieldAlert size={48} className="text-red-400 mb-4" />
              <p className="text-red-800 font-medium text-lg">No Journey Found</p>
              <p className="text-sm text-red-600 mt-2 text-center max-w-md">We couldn't calculate a route between these locations. They might not be connected in the current network dataset, or you may need to adjust your search terms.</p>
            </Card>
          ) : (
            <JourneyEmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyPlanner;

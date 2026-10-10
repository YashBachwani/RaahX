import React from 'react';
import { MapPin, Navigation, ArrowUpDown, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../Card';
import Button from '../Button';

const JourneySearchForm = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  onSearch,
  onClear,
  onSwap,
  error,
  stops,
  loading
}) => {
  return (
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
             <button onClick={onSwap} className="bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 text-raahx-navy" aria-label="Swap origin and destination">
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
            {stops.map(s => <option key={s.id} value={s.name} />)}
          </datalist>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-700 mt-2 text-sm">
              <ShieldAlert className="mr-2 flex-shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onSearch} disabled={loading} className="flex-1" icon={<Navigation size={16} />}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button onClick={onClear} disabled={loading} variant="secondary" className="px-4">Clear</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneySearchForm;

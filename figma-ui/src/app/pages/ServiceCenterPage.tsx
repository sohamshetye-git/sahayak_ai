import { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCenter {
  id: string;
  name: string;
  type: string;
  typeShort: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  distanceNum: number;
  appointmentRequired?: boolean;
  lat: number;
  lng: number;
}

const serviceCenters: ServiceCenter[] = [
  {
    id: '1',
    name: 'CSC Centre, Virar East',
    type: 'Common Service Centre (CSC)',
    typeShort: 'CSC',
    address: 'Shop No. 12, Sai Plaza, Station Road, Virar East, Maharashtra 401305',
    phone: '+91 98765 43210',
    hours: 'Mon-Sat, 9:00 AM - 6:00 PM',
    distance: '2.3 km away',
    distanceNum: 2.3,
    appointmentRequired: true,
    lat: 19.459,
    lng: 72.799,
  },
  {
    id: '2',
    name: 'Block Development Office, Vasai',
    type: 'Government Office',
    typeShort: 'Block Office',
    address: 'Near Tahsil Office, Vasai Road West, Palghar District, Maharashtra 401201',
    phone: '0250 234 5678',
    hours: 'Mon-Fri, 10:00 AM - 5:00 PM',
    distance: '4.5 km away',
    distanceNum: 4.5,
    lat: 19.368,
    lng: 72.837,
  },
  {
    id: '3',
    name: 'District Collector Office, Palghar',
    type: 'District Office',
    typeShort: 'District Office',
    address: 'Collectorate Compound, Palghar, Maharashtra 401404',
    phone: '02525 252 525',
    hours: 'Mon-Sat, 9:30 AM - 5:30 PM',
    distance: '12.1 km away',
    distanceNum: 12.1,
    lat: 19.696,
    lng: 72.769,
  },
  {
    id: '4',
    name: 'State Bank of India, Virar',
    type: 'Bank Partner',
    typeShort: 'Bank Partner',
    address: 'Main Road, Virar West, Palghar District, Maharashtra 401303',
    phone: '+91 22 4567 8901',
    hours: 'Mon-Fri, 10:00 AM - 4:00 PM',
    distance: '3.1 km away',
    distanceNum: 3.1,
    lat: 19.461,
    lng: 72.793,
  },
];

const filterTabs = ['CSC', 'Block Office', 'District Office', 'Bank Partner'];

// Simple static map visualization
function StaticMap({ centers, selected, onSelect }: { centers: ServiceCenter[]; selected: string | null; onSelect: (id: string) => void }) {
  // Create a visual grid-based map approximation
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-200 rounded-xl overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(100,150,200,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,200,0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Road lines */}
      <div className="absolute inset-0">
        <div className="absolute" style={{ left: '30%', top: 0, width: '3px', height: '100%', background: 'rgba(200,190,160,0.6)' }} />
        <div className="absolute" style={{ left: 0, top: '45%', width: '100%', height: '3px', background: 'rgba(200,190,160,0.6)' }} />
        <div className="absolute" style={{ left: '60%', top: '20%', width: '2px', height: '60%', background: 'rgba(200,190,160,0.4)' }} />
        <div className="absolute" style={{ left: '10%', top: '65%', width: '50%', height: '2px', background: 'rgba(200,190,160,0.4)' }} />
      </div>

      {/* Water body */}
      <div className="absolute rounded-full opacity-40" style={{ right: '5%', top: '10%', width: '120px', height: '80px', background: 'rgba(100,170,220,0.5)' }} />

      {/* Pins */}
      {centers.map((center, i) => {
        const positions = [
          { left: '38%', top: '35%' },
          { left: '25%', top: '58%' },
          { left: '65%', top: '70%' },
          { left: '42%', top: '55%' },
        ];
        const pos = positions[i] || { left: '50%', top: '50%' };
        const isSelected = selected === center.id;

        return (
          <div
            key={center.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{ left: pos.left, top: pos.top }}
            onClick={() => onSelect(center.id)}
          >
            <div className={`relative flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${isSelected ? 'bg-blue-600 scale-125' : 'bg-blue-500 hover:scale-110'}`}>
                <MapPin size={14} className="text-white" />
              </div>
              <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${isSelected ? '#2563eb' : '#3b82f6'}` }} />
            </div>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl p-3 w-48 border border-gray-200 z-10"
              >
                <p className="text-xs text-gray-900 mb-1">{center.name}</p>
                <p className="text-xs text-gray-500 mb-2">Distance: {center.distance}</p>
                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs">
                  <Navigation size={10} /> Get Directions
                </button>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* Label areas */}
      <div className="absolute text-xs text-gray-400" style={{ left: '5%', top: '15%' }}>Virar Road</div>
      <div className="absolute text-xs text-gray-400" style={{ left: '60%', top: '30%' }}>Hansra</div>
      <div className="absolute text-xs text-gray-600" style={{ left: '50%', top: '42%' }}>Virar</div>
      <div className="absolute text-xs text-gray-400" style={{ left: '12%', top: '72%' }}>Vasai</div>

      {/* Travel info bar */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-md p-3 border border-blue-100"
        >
          <p className="text-xs text-gray-500 mb-2">Estimated travel time:</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-gray-700">🚶 By Walking: 18 min</span>
            <span className="flex items-center gap-1 text-xs text-gray-700">🚲 By Bike: 7 min</span>
            <span className="flex items-center gap-1 text-xs text-gray-700">🚌 By Bus: 12 min</span>
          </div>
        </motion.div>
      )}

      {/* Info bar */}
      {!selected && (
        <div className="absolute bottom-3 left-3 right-3 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-blue-100">
          <AlertCircle size={14} className="text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">Carry required documents before visiting center.</p>
        </div>
      )}
    </div>
  );
}

export default function ServiceCenterPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('CSC');
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [locationLoading, setLocationLoading] = useState(false);

  const handleUseLocation = () => {
    setLocationLoading(true);
    setTimeout(() => {
      setSearch('Virar East, Maharashtra');
      setLocationLoading(false);
    }, 1500);
  };

  const filtered = serviceCenters.filter((c) => {
    const matchType = activeFilter === 'All' || c.typeShort === activeFilter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    return matchType || matchSearch;
  });

  const selectedCenter = serviceCenters.find((c) => c.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <h1 className="text-lg text-gray-900 mb-4">Find Nearest Service Center</h1>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter PIN code or District"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 text-gray-700 placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleUseLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap disabled:opacity-70"
              >
                <Navigation size={12} />
                {locationLoading ? 'Locating...' : 'Use My Location'}
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    activeFilter === tab
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Center List */}
          <div className="space-y-3">
            {serviceCenters.map((center, i) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedId(center.id)}
                className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${
                  selectedId === center.id
                    ? 'border-blue-400 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-gray-900">{center.name}</p>
                  <span className="text-xs text-green-600 shrink-0 ml-2">{center.distance}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Type: {center.type}</p>
                <p className="text-xs text-gray-500 flex items-start gap-1 mb-1">
                  <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
                  {center.address}
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Phone size={11} /> {center.phone}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={11} /> {center.hours}
                  </p>
                </div>
                {center.appointmentRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 mb-2">
                    ✓ Appointment Required
                  </span>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(center.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 border border-blue-600 text-blue-600 text-xs rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Navigation size={11} /> Get Directions
                  </button>
                  <a
                    href={`tel:${center.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone size={11} /> Call Now
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-3"
          style={{ minHeight: '500px' }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: '580px' }}>
            <StaticMap
              centers={serviceCenters}
              selected={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Location services used only to assist in finding nearby centers.
        </p>
      </div>
    </div>
  );
}

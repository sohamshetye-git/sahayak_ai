'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../lib/context/language-context';
import { useServiceCentersData } from '../../lib/hooks/use-service-centers-data';
import { serviceCentersDataService, ServiceCenter } from '../../lib/services/service-centers-data.service';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  Navigation, 
  Map as MapIcon,
  List,
  Search,
  Filter,
  ExternalLink,
  Loader,
  ArrowLeft,
  Home
} from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

type ViewMode = 'list' | 'map';

interface CenterWithDistance extends ServiceCenter {
  distance?: number;
}

export default function ServiceCentersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { centers, isLoading, error } = useServiceCentersData();
  
  // Get scheme context from URL params
  const fromScheme = searchParams.get('from');
  const schemeId = searchParams.get('schemeId');
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedState, setSelectedState] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [filteredCenters, setFilteredCenters] = useState<CenterWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Handle back navigation to scheme
  const handleBackToScheme = () => {
    if (schemeId) {
      router.push(`/schemes/${schemeId}`);
    } else {
      router.back();
    }
  };

  // Get unique states
  const states = useMemo(() => {
    if (centers.length === 0) return [];
    return serviceCentersDataService.getUniqueStates();
  }, [centers]);

  // Apply filters
  useEffect(() => {
    if (centers.length === 0) {
      setFilteredCenters([]);
      return;
    }

    const filtered = serviceCentersDataService.filterCenters({
      state: selectedState || undefined,
      district: districtSearch || undefined,
    });

    // If user location is available, add distance and sort
    if (userLocation) {
      const withDistance = filtered.map(center => ({
        ...center,
        distance: serviceCentersDataService.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          center.lat,
          center.lng
        )
      }));
      withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setFilteredCenters(withDistance);
    } else {
      setFilteredCenters(filtered);
    }
  }, [centers, selectedState, districtSearch, userLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'hi' 
        ? 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता' 
        : 'Your browser does not support geolocation');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(language === 'hi' 
          ? 'स्थान प्राप्त करने में त्रुटि। कृपया अनुमति दें।' 
          : 'Error getting location. Please allow location access.');
        setIsLocating(false);
      }
    );
  };

  const handleGetDirections = (center: ServiceCenter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  const handleViewOnMap = (center: ServiceCenter) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  const handleClearFilters = () => {
    setSelectedState('');
    setDistrictSearch('');
    setUserLocation(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl text-gray-800 mb-4">{language === 'hi' ? 'त्रुटि' : 'Error'}</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mb-3">
            {/* Back to Home Button - Always visible */}
            <button
              onClick={() => router.push('/home')}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              <Home size={20} />
              {language === 'hi' ? 'होम' : 'Home'}
            </button>
            
            {/* Back to Scheme Button - Show if coming from scheme */}
            {fromScheme === 'scheme' && schemeId && (
              <>
                <span className="text-gray-400">•</span>
                <button
                  onClick={handleBackToScheme}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  {language === 'hi' ? 'योजना पर वापस जाएं' : 'Back to Scheme'}
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'hi' ? 'निकटतम सेवा केंद्र' : 'Nearby Service Centers'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'hi' 
                  ? `${filteredCenters.length} केंद्र मिले` 
                  : `${filteredCenters.length} centers found`}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List size={18} />
                {language === 'hi' ? 'सूची' : 'List'}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <MapIcon size={18} />
                {language === 'hi' ? 'नक्शा' : 'Map'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'hi' ? 'फ़िल्टर' : 'Filters'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'राज्य' : 'State'}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{language === 'hi' ? 'सभी राज्य' : 'All States'}</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'जिला खोजें' : 'Search District'}
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  placeholder={language === 'hi' ? 'जिला का नाम दर्ज करें' : 'Enter district name'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Use My Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'निकटतम खोजें' : 'Find Nearest'}
              </label>
              <button
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className={`w-full px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  userLocation
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                } ${isLocating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLocating ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    {language === 'hi' ? 'स्थान प्राप्त कर रहे हैं...' : 'Getting location...'}
                  </>
                ) : userLocation ? (
                  <>
                    <Navigation size={18} />
                    {language === 'hi' ? 'स्थान सक्रिय' : 'Location Active'}
                  </>
                ) : (
                  <>
                    <Navigation size={18} />
                    {language === 'hi' ? 'मेरा स्थान उपयोग करें' : 'Use My Location'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedState || districtSearch || userLocation) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                {language === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
              </button>
            </div>
          )}
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredCenters.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'hi' ? 'कोई केंद्र नहीं मिला' : 'No centers found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'hi' 
                    ? 'अपने फ़िल्टर बदलने का प्रयास करें' 
                    : 'Try changing your filters'}
                </p>
              </div>
            ) : (
              filteredCenters.map((center) => (
                <CenterCard
                  key={center.center_id}
                  center={center}
                  language={language}
                  onGetDirections={handleGetDirections}
                  onViewOnMap={handleViewOnMap}
                />
              ))
            )}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <InteractiveMap
              centers={filteredCenters}
              userLocation={userLocation}
              language={language}
              onGetDirections={handleGetDirections}
              onViewOnMap={handleViewOnMap}
            />

            {/* Centers List Below Map */}
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'केंद्रों की सूची' : 'Centers List'}
              </h3>
              {filteredCenters.map((center) => (
                <div
                  key={center.center_id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => handleViewOnMap(center)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{center.office_type}</h3>
                      <p className="text-sm text-gray-600">{center.district}, {center.state}</p>
                      {center.distance !== undefined && (
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          {center.distance} km {language === 'hi' ? 'दूर' : 'away'}
                        </p>
                      )}
                    </div>
                    <MapPin size={20} className="text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Center Card Component
 */
function CenterCard({
  center,
  language,
  onGetDirections,
  onViewOnMap,
}: {
  center: CenterWithDistance;
  language: 'en' | 'hi';
  onGetDirections: (center: ServiceCenter) => void;
  onViewOnMap: (center: ServiceCenter) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              🏢
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{center.office_type}</h3>
              <p className="text-sm text-gray-600">{center.department_name}</p>
            </div>
          </div>

          {center.distance !== undefined && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
              <Navigation size={14} />
              {center.distance} km {language === 'hi' ? 'दूर' : 'away'}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {center.district}, {center.state}
            </p>
            <p className="text-sm text-gray-600">{center.address}</p>
            <p className="text-sm text-gray-500">{language === 'hi' ? 'पिनकोड' : 'Pincode'}: {center.pincode}</p>
          </div>
        </div>

        {/* Working Days */}
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{language === 'hi' ? 'कार्य दिवस' : 'Working Days'}:</span> {center.working_days}
          </p>
        </div>

        {/* Working Hours */}
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{language === 'hi' ? 'समय' : 'Hours'}:</span> {center.working_hours}
          </p>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-gray-500 flex-shrink-0" />
          <a href={`tel:${center.contact_phone}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {center.contact_phone}
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onGetDirections(center)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Navigation size={16} />
          {language === 'hi' ? 'दिशा-निर्देश प्राप्त करें' : 'Get Directions'}
        </button>
        <button
          onClick={() => onViewOnMap(center)}
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm flex items-center justify-center gap-2"
        >
          <ExternalLink size={16} />
          {language === 'hi' ? 'नक्शे पर देखें' : 'View on Map'}
        </button>
      </div>
    </div>
  );
}

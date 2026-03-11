'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ServiceCenter } from '../../lib/services/service-centers-data.service';
import { MapPin, Navigation, ExternalLink, Phone, Clock, Calendar } from 'lucide-react';
import styles from './InteractiveMap.module.css';
import './leaflet-minimal.css';
import type { Icon } from 'leaflet';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface CenterWithDistance extends ServiceCenter {
  distance?: number;
}

interface InteractiveMapProps {
  centers: CenterWithDistance[];
  userLocation?: { lat: number; lng: number } | null;
  language: 'en' | 'hi';
  onGetDirections: (center: ServiceCenter) => void;
  onViewOnMap: (center: ServiceCenter) => void;
}

export default function InteractiveMap({
  centers,
  userLocation,
  language,
  onGetDirections,
  onViewOnMap
}: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [customIcons, setCustomIcons] = useState<{
    serviceCenterIcon: Icon;
    userLocationIcon: Icon;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Load Leaflet CSS and create custom icons
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        // Try to load Leaflet CSS from CDN, fallback to local minimal CSS
        try {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        } catch (error) {
          console.log('Using local minimal Leaflet CSS');
        }
        
        // Import Leaflet and fix default markers
        const L = await import('leaflet');
        
        // Fix default markers
        delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create custom icons
        const serviceCenterIcon = new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          className: 'service-center-marker'
        });

        const userLocationIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
              <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
          className: 'user-location-marker'
        });

        setCustomIcons({ serviceCenterIcon, userLocationIcon });
        setLeafletLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Calculate map center and zoom based on centers
  const getMapBounds = () => {
    if (centers.length === 0) {
      return { center: [20.5937, 78.9629] as [number, number], zoom: 5 }; // India center
    }

    if (userLocation) {
      return { center: [userLocation.lat, userLocation.lng] as [number, number], zoom: 10 };
    }

    // Calculate bounds from centers
    const lats = centers.map(c => c.lat);
    const lngs = centers.map(c => c.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return { center: [centerLat, centerLng] as [number, number], zoom: 8 };
  };

  const { center, zoom } = getMapBounds();

  if (!isClient || !leafletLoaded || !customIcons) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'hi' ? 'मानचित्र लोड हो रहा है...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video rounded-xl overflow-hidden border border-gray-200 ${styles.mapContainer}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={customIcons.userLocationIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="text-blue-600 text-lg mb-2">📍</div>
                <p className="font-semibold">
                  {language === 'hi' ? 'आपका स्थान' : 'Your Location'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Service center markers */}
        {centers.map((center) => (
          <Marker
            key={center.center_id}
            position={[center.lat, center.lng]}
            icon={customIcons.serviceCenterIcon}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-3">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {center.office_type}
                    </h3>
                    <p className="text-xs text-gray-600">{center.department_name}</p>
                  </div>
                </div>

                {/* Distance */}
                {center.distance !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                    <Navigation size={12} />
                    {center.distance} km {language === 'hi' ? 'दूर' : 'away'}
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 mb-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {center.district}, {center.state}
                      </p>
                      <p className="text-gray-600">{center.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500 flex-shrink-0" />
                    <p className="text-gray-700">{center.working_hours}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                    <p className="text-gray-700">{center.working_days}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500 flex-shrink-0" />
                    <a 
                      href={`tel:${center.contact_phone}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {center.contact_phone}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onGetDirections(center)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <Navigation size={12} />
                    {language === 'hi' ? 'दिशा' : 'Directions'}
                  </button>
                  <button
                    onClick={() => onViewOnMap(center)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    {language === 'hi' ? 'देखें' : 'View'}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
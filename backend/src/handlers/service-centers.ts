/**
 * Service Centers Handler
 * Lambda function for retrieving service center information
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Mock service centers data (in production, query from RDS)
const mockServiceCenters = [
  {
    centerId: 'SC001',
    name: 'District Collectorate Office',
    nameHi: 'जिला कलेक्टर कार्यालय',
    district: 'Mumbai',
    state: 'Maharashtra',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    addressHi: '123 मुख्य मार्ग, मुंबई, महाराष्ट्र 400001',
    phone: '+91-22-12345678',
    email: 'collectorate.mumbai@gov.in',
    latitude: 19.0760,
    longitude: 72.8777,
    operatingHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    services: ['Scheme Applications', 'Document Verification', 'Grievance Redressal'],
  },
  {
    centerId: 'SC002',
    name: 'Tehsil Office',
    nameHi: 'तहसील कार्यालय',
    district: 'Pune',
    state: 'Maharashtra',
    address: '456 Civil Lines, Pune, Maharashtra 411001',
    addressHi: '456 सिविल लाइन्स, पुणे, महाराष्ट्र 411001',
    phone: '+91-20-23456789',
    email: 'tehsil.pune@gov.in',
    latitude: 18.5204,
    longitude: 73.8567,
    operatingHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    services: ['Scheme Applications', 'Document Verification'],
  },
];

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const { queryStringParameters } = event;
    const {
      district,
      state,
      latitude,
      longitude,
      radius = '50',
      language = 'en',
    } = queryStringParameters || {};

    let centers = [...mockServiceCenters];

    // Filter by district
    if (district) {
      centers = centers.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    }

    // Filter by state
    if (state) {
      centers = centers.filter((c) => c.state.toLowerCase() === state.toLowerCase());
    }

    // Calculate distances if location provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      centers = centers
        .map((center) => ({
          ...center,
          distance: calculateDistance(userLat, userLon, center.latitude, center.longitude),
        }))
        .filter((center) => center.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
    }

    // Format for language
    const formattedCenters = centers.map((center) => ({
      ...center,
      name: language === 'hi' ? center.nameHi : center.name,
      address: language === 'hi' ? center.addressHi : center.address,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        serviceCenters: formattedCenters,
        total: formattedCenters.length,
      }),
    };
  } catch (error) {
    console.error('Service centers handler error:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve service centers',
          details: error.message,
          timestamp: Date.now(),
        },
      }),
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

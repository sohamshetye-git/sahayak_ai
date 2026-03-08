/**
 * Service Centers Data Service
 * Single source of truth for all service center data
 * Loads and manages data from service_centers.json
 */

export interface ServiceCenter {
  center_id: string;
  office_type: string;
  department_name: string;
  district: string;
  state: string;
  address: string;
  pincode: string;
  working_days: string;
  working_hours: string;
  contact_phone: string;
  lat: number;
  lng: number;
}

export interface ServiceCentersDataset {
  centers: ServiceCenter[];
}

class ServiceCentersDataService {
  private centers: ServiceCenter[] = [];
  private loaded: boolean = false;

  async loadCenters(): Promise<void> {
    if (this.loaded) return;

    try {
      console.log('[ServiceCentersDataService] Loading centers from /data/service_centers.json');
      const response = await fetch('/data/service_centers.json');
      if (!response.ok) {
        throw new Error(`Failed to load service centers data: ${response.status}`);
      }
      
      const data: ServiceCentersDataset = await response.json();
      this.centers = data.centers || [];
      this.loaded = true;
      console.log(`[ServiceCentersDataService] Loaded ${this.centers.length} centers successfully`);
    } catch (error) {
      console.error('[ServiceCentersDataService] Error loading centers:', error);
      this.centers = [];
      this.loaded = true;
    }
  }

  getAllCenters(): ServiceCenter[] {
    return this.centers;
  }

  getCenterById(centerId: string): ServiceCenter | undefined {
    return this.centers.find(c => c.center_id === centerId);
  }

  getCentersByState(state: string): ServiceCenter[] {
    return this.centers.filter(c => 
      c.state.toLowerCase() === state.toLowerCase()
    );
  }

  getCentersByDistrict(district: string): ServiceCenter[] {
    return this.centers.filter(c =>
      c.district.toLowerCase().includes(district.toLowerCase())
    );
  }

  filterCenters(filters: {
    state?: string;
    district?: string;
  }): ServiceCenter[] {
    let filtered = this.centers;

    if (filters.state) {
      filtered = filtered.filter(c => 
        c.state.toLowerCase() === filters.state!.toLowerCase()
      );
    }

    if (filters.district) {
      const districtLower = filters.district.toLowerCase();
      filtered = filtered.filter(c =>
        c.district.toLowerCase().includes(districtLower)
      );
    }

    return filtered;
  }

  getUniqueStates(): string[] {
    const states = new Set(this.centers.map(c => c.state));
    return Array.from(states).sort();
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getNearestCenters(userLat: number, userLng: number, limit?: number): Array<ServiceCenter & { distance: number }> {
    const centersWithDistance = this.centers.map(center => ({
      ...center,
      distance: this.calculateDistance(userLat, userLng, center.lat, center.lng)
    }));

    // Sort by distance
    centersWithDistance.sort((a, b) => a.distance - b.distance);

    return limit ? centersWithDistance.slice(0, limit) : centersWithDistance;
  }
}

// Singleton instance
export const serviceCentersDataService = new ServiceCentersDataService();

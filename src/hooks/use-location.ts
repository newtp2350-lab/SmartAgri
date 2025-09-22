import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocation = () => {
      console.log('Loading location from localStorage...');
      const savedLocation = localStorage.getItem('farmLocation');
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          console.log('Found saved location:', parsedLocation);
          setLocation(parsedLocation);
        } catch (error) {
          console.error('Failed to parse saved location:', error);
          localStorage.removeItem('farmLocation');
        }
      } else {
        console.log('No saved location found');
      }
      console.log('Setting isLoading to false');
      setIsLoading(false);
    };

    // Load location on mount
    loadLocation();

    // Listen for storage changes (when location is updated from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmLocation') {
        loadLocation();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleLocationUpdate = () => {
      loadLocation();
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, []);

  const updateLocation = (newLocation: Location) => {
    setLocation(newLocation);
    localStorage.setItem('farmLocation', JSON.stringify(newLocation));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('locationUpdated'));
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('farmLocation');
    window.dispatchEvent(new CustomEvent('locationUpdated'));
  };

  return {
    location,
    isLoading,
    updateLocation,
    clearLocation,
  };
};


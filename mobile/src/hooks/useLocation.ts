import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setIsLoading(false);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      setError('Failed to get location');
      setIsLoading(false);
      return null;
    }
  }, []);

  return { getCurrentLocation, isLoading, error };
}
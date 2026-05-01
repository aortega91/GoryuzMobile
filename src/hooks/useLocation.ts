import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@utilities/store';
import { setCityName } from '@utilities/locationSlice';
import { logError } from '@utilities/crashlytics';

const LOCATION_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  // TODO: swap URL for Google Maps when billing is set up:
  // `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GoryuzMobile/1.0' },
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json() as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      county?: string;
    };
  };
  const addr = data.address;
  return addr?.city ?? addr?.town ?? addr?.village ?? addr?.municipality ?? addr?.county ?? null;
}

function useLocation() {
  const dispatch = useDispatch<AppDispatch>();
  const [locationBlocked, setLocationBlocked] = useState(false);

  const detectLocation = useCallback(async () => {
    try {
      const status = await check(LOCATION_PERMISSION);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        // Already granted — fetch straight away
      } else if (status === RESULTS.DENIED) {
        const next = await request(LOCATION_PERMISSION);
        if (next === RESULTS.BLOCKED) {
          setLocationBlocked(true);
          return;
        }
        if (next !== RESULTS.GRANTED && next !== RESULTS.LIMITED) {
          return;
        }
      } else {
        // BLOCKED or UNAVAILABLE
        setLocationBlocked(true);
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          const city = await reverseGeocode(latitude, longitude);
          dispatch(setCityName(city));
        },
        error => {
          logError(new Error(error.message), 'useLocation.getCurrentPosition');
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    } catch (err: unknown) {
      logError(err instanceof Error ? err : new Error(String(err)), 'useLocation.detectLocation');
    }
  }, [dispatch]);

  const handleOpenLocationSettings = useCallback(() => {
    openSettings();
    setLocationBlocked(false);
  }, []);

  const dismissLocationBlocked = useCallback(() => {
    setLocationBlocked(false);
  }, []);

  return { detectLocation, locationBlocked, handleOpenLocationSettings, dismissLocationBlocked };
}

export default useLocation;

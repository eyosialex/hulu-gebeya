import { useState, useEffect } from "react";

export type GeolocationState = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        isLoading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let message = "An unknown error occurred";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "User denied the request for Geolocation";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          message = "The request to get user location timed out";
          break;
      }
      setState((s) => ({
        ...s,
        error: message,
        isLoading: false,
      }));
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return state;
}

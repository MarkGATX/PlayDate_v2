"use client";

import { useEffect, useState } from "react";
import { LocationContext, LocationData } from "./LocationContext";

//LocationProvider component that holds initial state, returns provider component
export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    updated:false
  });

  useEffect(() => {
    const locationSuccess = (position: GeolocationPosition) => {
      setLocationData({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        updated:true
      });
    };

    const locationError = () => {
      console.error("Error in getting location");
      setLocationData({
        latitude: 0,
        longitude: 0,
        error: "Error in getting location",
      });
    };

    if ("geolocation" in navigator) {
      //Geolocation available
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError, {
        enableHighAccuracy: true,
      });
    } else {
      // Geolocation is not available
      setLocationData({
        latitude: 0,
        longitude: 0,
        error: "Geolocation is not available",
      });
    }
  }, []);

  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  );
};

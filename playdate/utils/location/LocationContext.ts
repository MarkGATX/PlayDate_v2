'use client'

import { createContext, useContext } from "react";

export type LocationData = {
    latitude: number;
    longitude: number;
    error?: string;
}
// Initialize new context for location
export const LocationContext = createContext<LocationData>({
    latitude: 0,
    longitude: 0,
});

// We create a custom hook to provide immediate usage of the location context in other components
export const useLocationContext = () => useContext(LocationContext);


'use client'

import { createContext} from "react";

export interface LocationData {
    latitude: number;
    longitude: number;
    error?: string;
}
// Initialize new context for location
export const LocationContext = createContext<LocationData>({
    latitude: 0,
    longitude: 0,
});

// We create a custom hook to provide immediate usage of the location context in other components. Causes errors 
// export const useLocationContext = () => useContext(LocationContext);


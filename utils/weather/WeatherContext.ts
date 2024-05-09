'use client'

import { createContext } from "react";

interface WeatherContextInterface {
    weatherData: CombinedForecastData | undefined;
    error: string | null;
}

export interface CombinedForecastData {
    current_temp: number
    low_temp: number
    high_temp: number
    current_icon: number
    current_id: number
    rain_chance: number | null
    forecast?: string
    error?: string | null
}

// Initialize new context for location
export const WeatherContext = createContext<WeatherContextInterface>({
    weatherData: {
        current_temp: 0,
        low_temp: 0,
        high_temp: 0,
        current_icon: 0,
        current_id: 0,
        rain_chance: 0,
        forecast:''        
    },
    error:null
});
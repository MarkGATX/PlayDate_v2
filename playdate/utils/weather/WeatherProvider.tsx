'use client'

import { useContext, useEffect, useState } from "react";
import { CombinedForecastData, WeatherContext } from "./WeatherContext";
import { LocationContext } from "../location/LocationContext";
import { getCurrentNWSWeather } from "./NWSWeather";


//WeatherProvider component that holds initial state, returns provider component
export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
    const [weatherData, setWeatherData] = useState<CombinedForecastData>();
    const [error, setError] = useState<string | null>(null);
    const currentLocation = useContext(LocationContext)

    useEffect(() => {
        if (currentLocation.latitude && currentLocation.longitude) {
            const fetchWeatherData = async () => {
                try {
                    const currentWeather = await getCurrentNWSWeather(currentLocation.latitude, currentLocation.longitude);
                    if (currentWeather) {
                        setWeatherData(currentWeather);
                        setError(null);
                    }
                } catch (error: any) {
                    // setError('Error in getting weather information')
                    setError(error)
                }
            };

            fetchWeatherData();
        }
    }, [currentLocation]);

    return (
        <WeatherContext.Provider value={{ weatherData, error }}>
            {children}
        </WeatherContext.Provider>
    )
};

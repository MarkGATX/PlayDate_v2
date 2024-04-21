'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { fetchMap } from "@/utils/map/fetchMap";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { useContext, useEffect } from "react";

export default function Map() {
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)  
    const currentWeatherCode = currentWeather.weatherData?.current_icon
    console.log(currentWeatherCode)

    useEffect(() => {
        
        const fetchMapData = async () => {
            if (currentLocation && currentWeather && currentWeather.weatherData) {
            const mapUrls = await fetchMap(currentLocation.latitude, currentLocation.longitude, currentWeatherCode);
            console.log(mapUrls)
            }
        };
        fetchMapData();
    }, [currentLocation, currentWeather]);

    return (
        <div></div>
    )
}
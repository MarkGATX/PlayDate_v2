'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { getActivitiesFromWeather } from "@/utils/map/mapData";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { useContext, useEffect, useRef } from "react";
import Map from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import styles from './MapContainer.module.scss'


export default function MapContainer() {
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)
    const currentWeatherCode = currentWeather.weatherData?.current_icon

    useEffect(() => {

        const fetchMapData = async () => {
            if (currentLocation.latitude != 0 && currentWeather && currentWeather.weatherData) {
                const mapUrls = await getActivitiesFromWeather(currentLocation.latitude, currentLocation.longitude, currentWeatherCode);
                console.log(mapUrls)
            }
        };
        fetchMapData();

    }, [currentLocation, currentWeather, currentWeatherCode]);

    return (
        <>
            {/* <div >
                Longitude: {currentLocation.longitude} | Latitude: {currentLocation.latitude}
            </div> */}
            {(currentLocation.latitude != 0 && currentLocation.longitude != 0) ?
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API}
                    initialViewState={{
                        longitude: currentLocation.longitude,
                        latitude: currentLocation.latitude,
                        zoom: 11
                    }}
                    style={{ width: '100dvw', height: '40dvh' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                />
                :
                <div>Loading Map data...</div>
            }
        </>
    )
}
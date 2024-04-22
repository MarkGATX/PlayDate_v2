'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { getActivitiesFromWeather } from "@/utils/map/mapData";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { useContext, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
// import Map from 'react-map-gl'
// import styles from './MapContainer.module.scss'

export default function MapContainer() {
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)
    const currentWeatherCode = currentWeather.weatherData?.current_icon
    const mapContainer = useRef<any>(null)
    const map = useRef<mapboxgl.Map | any>(null);

    console.log(currentWeatherCode)

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_MAPBOX_API) {
            mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API
            // if (map.current) return; // initialize map once
            if (currentLocation && mapContainer.current) {
                console.log(currentLocation)
                map.current = new mapboxgl.Map({
                    container: mapContainer.current, // container ID
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [currentLocation.longitude, currentLocation.latitude], // starting position [lng, lat]
                    zoom: 11 // starting zoom
                });
                console.log(map.current)
            }
            // if (map.current) {
            // Add navigation control (the +/- zoom buttons)
            // map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // map.current.on('move', () => {
            //     setLng(map.getCenter().lng.toFixed(4));
            //     setLat(map.getCenter().lat.toFixed(4));
            //     setZoom(map.getZoom().toFixed(2));
            // });
            // }

            // Clean up on unmount

        }
        const fetchMapData = async () => {
            if (currentLocation && currentWeather && currentWeather.weatherData) {
                const mapUrls = await getActivitiesFromWeather(currentLocation.latitude, currentLocation.longitude, currentWeatherCode);
                console.log(mapUrls)
            }
        };
        fetchMapData();

    }, [currentLocation, currentWeather]);

    return (
        <>
            <div >
                Longitude: {currentLocation.longitude} | Latitude: {currentLocation.latitude}
            </div>
            <div id='map' className="map-container" ref={mapContainer}>
                <div ref={map} ></div>
            </div>
        </>
    )
}
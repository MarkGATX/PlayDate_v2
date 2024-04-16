'use client'
import Image from "next/image";
import Weather from "../Weather/Weather";
import { Suspense, useEffect, useState } from "react";
import WeatherSuspense from "../Weather/WeatherSuspense";


export interface LocationData {
    latitude: number;
    longitude: number;
    error?: string;
}

export default function Header() {
    const [locationData, setLocationData] = useState<LocationData>({
        latitude: 0,
        longitude: 0
    });
    useEffect(() => {
        const locationSuccess = (position: GeolocationPosition) => {
            setLocationData({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        };

        const locationError = () => {
            console.error('Error in getting location');
            setLocationData({
                latitude: 0,
                longitude: 0,
                error: "Error in getting location"
            });
        };

        if ('geolocation' in navigator) {
            console.log('Geolocation is available');
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
        } else {
            console.log('Geolocation is not available');
            setLocationData({ latitude: 0, longitude: 0, error: "Geolocation is not available" });
        }

    }, [])

    return (
        <>
            <header className="w-full h-8 pt-2 pr-2 pl-2">
                <Image
                    src="/logos/playdate_logo.webp"
                    alt='Playdate logo'
                    width='100'
                    height='20'
                    className=''>
                </Image>
            </header>
            <Suspense fallback={<WeatherSuspense />}>
                <Weather locationData={locationData} />
            </Suspense>
        </>
    )
}
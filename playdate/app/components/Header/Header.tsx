'use client'

import Image from "next/image";
import Weather from "../Weather/Weather";
import { useState } from "react";

// export interface WeatherProps {
//     lat: number;
//     long: number;
//     error?: string;
// }

export default function Header() {
    // const [lat, setLat] = useState<number>(0)
    // const [long, setLong] = useState<number>(0)
    // const [error, setError] = useState<string | undefined>();
    // const locationSuccess = async (position: GeolocationPosition) => {
    //     setLat(position.coords.latitude)
    //     setLong(position.coords.longitude)
    // }

    // const locationError = async () => {
    //     console.error('error in getting location')
    //     setError("Error in getting location")
    // }

    // //Check for geolocation in browser
    // if ('geolocation' in navigator) {
    //     console.log('geolocation is available');
    //     // continue with using geolocation 
    //     navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    // } else {
    //     console.log(' geolocation IS NOT available ');
    //     setError("Geolocation is not available")
    // };

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
            <Weather />
        </>
    )
}
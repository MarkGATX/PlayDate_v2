import { getCurrentWeather } from "@/utils/weather/weatherData";
import { useEffect, useState } from "react";
import { LocationData } from "../Header/Header";
import { WeatherData } from "@/utils/weather/weatherData";
import { CombinedForecastData, getCurrentNWSWeather } from "@/utils/weather/NWSWeather";


interface WeatherProps {
    locationData: LocationData;
}
export default function Weather({ locationData }: WeatherProps) {

    const [currentWeather, setCurrentWeather] = useState<CombinedForecastData | undefined>(); // State to store weather data

    useEffect(() => {
        const fetchData = async () => {
            if (locationData.latitude && locationData.longitude) { // Check for valid location data
                try {
                    const weatherResponse = await getCurrentNWSWeather(locationData.latitude, locationData.longitude);
                    setCurrentWeather(weatherResponse);
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            } else {
                console.warn('Missing location data in props');
            }
        };

        fetchData();
    }, [locationData]);

    console.log(currentWeather)
    return (
        <section className='w-full pl-2 pr-2'>
            <p>Weather</p>
            {locationData.error ?
                <div>Weather info not available</div>
                :
                <>
                    <div>{locationData.latitude}</div>
                    <div>{locationData.longitude}</div>
                    {/* {!currentWeather ?
                        <div>loading</div>
                        :
                        <>
                        <div>{currentWeather?.main.temp.toFixed(0)} degrees</div>
                        <div>{currentWeather?.main.temp_max.toFixed(0)} degrees</div>
                        </>
                    } */}
                </>
            }
        </section>
    )
}
import { useEffect, useState } from "react";
import { LocationData } from "../Header/Header";
import { CombinedForecastData, getCurrentNWSWeather } from "@/utils/weather/NWSWeather";
import Image from "next/image";

interface WeatherProps {
    locationData: LocationData;
}
export default function Weather({ locationData }: WeatherProps) {
    const [currentTempLeftPosition, setCurrentTempLeftPosition] = useState<number>(0)
    const [currentWeather, setCurrentWeather] = useState<CombinedForecastData | undefined>(); // State to store weather data

    useEffect(() => {
        const fetchWeatherData = async () => {
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
        fetchWeatherData();

    }, [locationData]);

    useEffect(() => {
        if (currentWeather) {
            const temperatureRange = currentWeather.high_temp - currentWeather.low_temp;
            console.log(temperatureRange);
            const currentTempOffset = currentWeather.current_temp - currentWeather.low_temp;
            setCurrentTempLeftPosition((currentTempOffset / temperatureRange) * 100); // Percentage
        }
    }, [currentWeather]);

    console.log(currentWeather)
    return (
        <section id='weatherConditions' className='w-full pl-2 pr-2 flex justify-between items-center'>
            {locationData.error ?
                <div>Weather info not available</div>
                :
                <>
                    {!currentWeather ?
                        <section id='weatherConditions' className="w-3/4 pl-1 pr-1 flex items-center justify-between">
                            Getting current weather
                        </section>
                        :
                        <>
                            <section id='tempRange' className="w-2/3 max-w-2/3 pl-1 pr-1 flex items-center justify-between">
                                <img src={`https://openweathermap.org/img/wn/${currentWeather.current_id}@2x.png`} width='32' height='32' alt="current weather icon" className='mr-1'></img>
                                <div className='w-4 mr-1 text-xs'>{currentWeather.low_temp.toFixed(0)}°</div>
                                <span className='relative w-3/4 h-0.5 tempBackground'>
                                    <div className={`absolute -top-3`} style={{ left: `${(currentTempLeftPosition).toFixed(0)}%` }}>
                                        {currentWeather.current_temp}
                                    </div>
                                </span>
                                <div className='w-4 ml-1 text-xs'>{currentWeather.high_temp.toFixed(0)}°</div>
                            </section>
                            <section id='rainChance' className='w-1/4 ml-1 text-sm text-right'>
                                {currentWeather.rain_chance === null || currentWeather.rain_chance === 0 ?
                                    null
                                    :
                                    <div>{currentWeather.rain_chance}% rain</div>
                                }
                            </section>
                        </>
                    }
                </>
            }
        </section>
    )
}
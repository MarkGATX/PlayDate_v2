'use client'
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { LocationContext } from "@/utils/location/LocationContext";
import { WeatherContext } from "@/utils/weather/WeatherContext";

// export default function Weather({ locationData }: WeatherProps) {
export default function Weather() {
    const [currentTempLeftPosition, setCurrentTempLeftPosition] = useState<number>(0)
    const locationData = useContext(LocationContext);
    const currentWeather = useContext(WeatherContext).weatherData
    const weatherError = useContext(WeatherContext).error
    console.log('weather context: ', currentWeather)

    useEffect(() => {
        if (currentWeather) {
            const temperatureRange = currentWeather.high_temp- currentWeather.low_temp;
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
                currentWeather?.error ?
                    <div className="w-3/4 pl-1 pr-1 flex items-center justify-between">
                        Weather not available: {weatherError}
                    </div>
                    :
                    <>
                        {!currentWeather ?
                            <div className="w-3/4 pl-1 pr-1 flex items-center justify-between">
                                Getting current weather
                            </div>
                            :
                            <>
                                <section id='tempRange' className="w-2/3 max-w-2/3 pr-1 flex items-center justify-between">
                                    <Image src={`/weather_icons/${currentWeather.current_id}.webp`} width='32' height='32' alt="current weather icon" className='mr-1.5'></Image>
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
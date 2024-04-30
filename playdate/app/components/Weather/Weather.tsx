'use client'
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { LocationContext } from "@/utils/location/LocationContext";
import { WeatherContext } from "@/utils/weather/WeatherContext";

// export default function Weather({ locationData }: WeatherProps) {
export default function Weather() {
    const [currentTempLeftPosition, setCurrentTempLeftPosition] = useState<number>(0)
    const [showDetails, setShowDetails] = useState<boolean>(false)
    const locationData = useContext(LocationContext);
    const currentWeather = useContext(WeatherContext).weatherData
    const weatherError = useContext(WeatherContext).error
    console.log('weather context: ', currentWeather)

    useEffect(() => {
        if (currentWeather) {
            const temperatureRange = currentWeather.high_temp - currentWeather.low_temp;

            const currentTempOffset = currentWeather.current_temp - currentWeather.low_temp;
            setCurrentTempLeftPosition((currentTempOffset / temperatureRange) * 100); // Percentage
        }
    }, [currentWeather]);

    console.log(currentWeather)
    return (
        <>
            <section id='weatherConditions' className='relative w-full flex flex-wrap justify-between items-center'>
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
                                    <section id='tempRange' className="w-2/3 max-w-2/3 pr-1 flex items-center justify-between z-1">
                                        <Image src={`/weather_icons/${currentWeather.current_id}.webp`} width={32} height={32} alt="current weather icon" className='mr-1.5' title={currentWeather.forecast}></Image>
                                        <div className='w-4 mr-3 text-xs'>{currentWeather.low_temp.toFixed(0)}°</div>
                                        <span className='relative w-3/4 h-0.5 tempBackground'>
                                            {/* toFixed returns a string so convert back to number for ternary */}
                                            <div className={`absolute -top-3`} style={{ left: Math.round(currentTempLeftPosition) > 90 ? `90%` : `${(currentTempLeftPosition).toFixed(0)}%` }}>
                                                {currentWeather.current_temp}
                                            </div>
                                        </span>
                                        <div className='w-4 ml-3 mr-3 text-xs'>{currentWeather.high_temp.toFixed(0)}°</div>
                                        <div className='weatherToggle p-2 rounded-md cursor-pointer hover:scale-125 transform ease-in-out duration-300' onClick={(() => setShowDetails(previousState => !previousState))}>
                                            <Image src={`/icons/down_arrow.webp`} width={15} height={16} alt='down icon to show more details' title='more details' className={`transform ease-in-out duration-700 ${showDetails ? '-rotate-180' : 'rotate-0'} `}></Image>
                                        </div>
                                    </section>
                                    <section id='rainChance' className='w-1/4 ml-1 text-sm text-right z-1'>
                                        {currentWeather.rain_chance === null || currentWeather.rain_chance === 0 ?
                                            null
                                            :
                                            <div>{currentWeather.rain_chance}% rain</div>
                                        }
                                    </section>
                                    <section id='weather_details' className={`w-100 text-xs mt-2 p-1 overflow-y-hidden transition-all ease-in-out duration-700 ${showDetails ? 'opacity-100 h-20 ' : 'opacity-0 h-0'}`}
                                    >{currentWeather.forecast}</section>
                                </>
                            }
                        </>
                }
            </section>
            {/* {!currentWeather ?
                null
                :
                <section id='weather_details' className={`absolute w-100 top-0 z-0 text-xs mt-2 h-auto transition-transform transform ease-in-out duration-300 ${showDetails ? 'opacity-100 translate-y-100' : 'opacity-0 -translate-y-full'}`}
                >{currentWeather.forecast}</section>
            } */}
        </>
    )
}
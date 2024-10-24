"use client";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LocationContext } from "@/utils/location/LocationContext";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// export default function Weather({ locationData }: WeatherProps) {
export default function Weather() {
  const [currentTempLeftPosition, setCurrentTempLeftPosition] =
    useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const weatherDetailsRef = useRef<HTMLElement>(null);
  const weatherForecastText = useRef<HTMLDivElement>(null);
  const locationData = useContext(LocationContext);
  const currentWeather = useContext(WeatherContext).weatherData;
  const weatherError = useContext(WeatherContext).error;
  let weatherDetailsHeight: number = 0;

  useEffect(() => {
    if (currentWeather) {
      const temperatureRange =
        currentWeather.high_temp - currentWeather.low_temp;

      const currentTempOffset =
        currentWeather.current_temp - currentWeather.low_temp;
      if (currentTempOffset >= 0) {
        setCurrentTempLeftPosition(
          (currentTempOffset / temperatureRange) * 100,
        ); // Percentage
      } else {
        setCurrentTempLeftPosition(0);
      }
    }
  }, [currentWeather]);

  const { contextSafe } = useGSAP();

  const handleShowWeather = contextSafe(() => {
    if (weatherForecastText.current) {
      if (!showDetails) {
        const weatherForecastHeight = weatherForecastText.current.offsetHeight;
        gsap.to(weatherDetailsRef.current, {
          height: weatherForecastHeight * 1.8,
          autoAlpha: 1,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowDetails((previousValue) => !previousValue);
      } else {
        gsap.to(weatherDetailsRef.current, {
          height: 0,
          autoAlpha: 0,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowDetails((previousValue) => !previousValue);
      }
    }
  });

  return (
    <>
      <section
        id="weatherConditions"
        className="relative flex w-full flex-wrap items-center justify-between"
      >
        {locationData.error ? (
          <div>Weather info not available. Is geolocation approved?</div>
        ) : currentWeather?.error ? (
          <div className="flex w-3/4 items-center justify-between pl-1 pr-1">
            Weather not available: {weatherError}
          </div>
        ) : (
          <>
            {!currentWeather ? (
              <div className="flex w-3/4 items-center justify-between pl-1 pr-1">
                Getting current weather
              </div>
            ) : (
              <>
                <section
                  id="tempRange"
                  className="max-w-2/3 z-1 mb-2 flex w-2/3 items-center justify-between pr-1"
                >
                  <Image
                    src={`/weather_icons/${currentWeather.current_id}.webp`}
                    width={32}
                    height={32}
                    alt="current weather icon"
                    className="mr-1.5"
                    title={currentWeather.forecast}
                  ></Image>
                  <div className="mr-3 w-4 text-xs">
                    {currentWeather.low_temp.toFixed(0)}°
                  </div>
                  <span className="tempBackground relative h-0.5 w-3/4">
                    {/* toFixed returns a string so convert back to number for ternary */}
                    <div
                      className={`absolute -top-3`}
                      style={{
                        left:
                          Math.round(currentTempLeftPosition) > 90
                            ? `90%`
                            : `${currentTempLeftPosition.toFixed(0)}%`,
                      }}
                    >
                      {currentWeather.current_temp}
                    </div>
                  </span>
                  <div className="ml-3 mr-3 w-4 text-xs">
                    {currentWeather.high_temp.toFixed(0)}°
                  </div>
                  {/* <div className='bg-appGold p-2 rounded-md cursor-pointer hover:scale-125 transform ease-in-out duration-300' onClick={(() => setShowDetails(previousState => !previousState))}> */}
                  <div
                    className="transform cursor-pointer rounded-md bg-appGold p-2 duration-300 ease-in-out hover:scale-125"
                    onClick={handleShowWeather}
                  >
                    <Image
                      src={`/icons/down_arrow.webp`}
                      width={15}
                      height={16}
                      alt="down icon to show more details"
                      title="more details"
                      className={`transform duration-700 ease-in-out ${showDetails ? "-rotate-180" : "rotate-0"} `}
                    ></Image>
                  </div>
                </section>
                <section
                  id="rainChance"
                  className="z-1 ml-1 w-1/4 text-right text-sm"
                >
                  {currentWeather.rain_chance === null ||
                  currentWeather.rain_chance === 0 ? null : (
                    <div>{currentWeather.rain_chance}% rain</div>
                  )}
                </section>
                {/* need to use GSAP to animate open and close to exact height of element. Refs are set just need to implement. using h-20 now for smooth animation but doesn't work for large text areas */}
                <section
                  id="weather_details"
                  ref={weatherDetailsRef}
                  className={`w-100 mb-4 h-0 overflow-y-hidden text-xs opacity-0 transition-all duration-700 ease-in-out`}
                >
                  <div ref={weatherForecastText}>{currentWeather.forecast}</div>
                </section>
              </>
            )}
          </>
        )}
      </section>
      {/* {!currentWeather ?
                null
                :
                <section id='weather_details' className={`absolute w-100 top-0 z-0 text-xs mt-2 h-auto transition-transform transform ease-in-out duration-300 ${showDetails ? 'opacity-100 translate-y-100' : 'opacity-0 -translate-y-full'}`}
                >{currentWeather.forecast}</section>
            } */}
    </>
  );
}

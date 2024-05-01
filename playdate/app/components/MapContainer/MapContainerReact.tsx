'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { fetchNearbyPlaces, placesDataType } from "@/utils/map/googlePlacesAPI";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { APIProvider, AdvancedMarker, InfoWindow, Map, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useContext, useEffect, useState } from "react";
import { goodWeatherCodes } from "@/utils/map/activityTypes";
import { goodWeatherActivity } from "@/utils/map/activityTypes";
import { badWeatherActivity } from "@/utils/map/activityTypes";
import PlaceCards from "../PlaceCards/PlaceCards";

export default function MapContainerReact() {

    const [error, setError] = useState<string | null>(null);
    // const [mapMarkers, setMapMarkers] = useState(null)
    const [places, setPlaces] = useState<placesDataType[] | undefined>()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)


    useEffect(() => {
        const getPlaces = async () => {
            try {
                const activityTypes = goodWeatherCodes.includes(currentWeather.weatherData?.current_icon || 0)
                    ? goodWeatherActivity
                    : badWeatherActivity;

                let placesData: placesDataType[] | undefined;
                const storedPlacesData = localStorage.getItem('placesData')
                if (storedPlacesData) {
                    // Get the data from local storage
                    console.log(storedPlacesData)
                    placesData = JSON.parse(storedPlacesData);
                    console.log(placesData)
                    console.log('local storage places')
                    setPlaces(placesData)
                } else {
                    //get the data from Google Places
                    placesData = await fetchNearbyPlaces(activityTypes, currentLocation.latitude, currentLocation.longitude);
                    // Store the places in local storage
                    console.log('fetched places')
                    setPlaces(placesData)

                }
            } catch (error: any) {
                setError(error)
            }
        }
        getPlaces();
        console.log()

        // }
    }, [currentLocation, currentWeather])

    if (error) {
        return (
            <div> There was an error getting your map data: {error}</div>
        )
    }

    return (
        (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API && currentLocation.latitude != 0 && currentLocation.longitude != 0) ?
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}>
                {/* <div>{currentLocation.latitude} {currentLocation.longitude}</div> */}
                <Map
                    style={{ width: '100vw', height: '40dvh', marginBottom: '2rem' }}
                    defaultCenter={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                    defaultZoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAIN_MAP_ID}
                >
                    {places ?

                        places.slice((currentPage - 1) * 5, currentPage * 5).map((place) => {

                            return (
                                <AdvancedMarker key={place.id}
                                    position={{ lat: place.location.latitude, lng: place.location.longitude }}
                                    title={place.displayName.text}
                                    onClick= {() => document.getElementById(place.id)?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <div className={`p-1 bg-appBlue text-appGold rounded max-w-32 markerPin z-10 cursor-pointer`}  >
                                        <h3>{place.displayName.text.length >= 30 ? `${place.displayName.text.slice(0, 30)}...` : place.displayName.text}</h3>
                                    </div>
                                </AdvancedMarker>
                            )
                        })
                        :
                        null
                    }
                </Map>

                {places ?
                    <>
                        <div id='paginationButtons' className='flex justify-around w-full mb-12'>
                            <button className='px-4 w-[130px] text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                {currentPage === 1 ? 'Start' : 'Previous 5'}
                            </button>
                            <button className='px-4 w-[130px] text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 active:bg-appGold active:shadow-activeButton active:text-appBlue disabled:opacity-50  disabled:pointer-events-none' onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * 5 >= places.length}>
                                {currentPage * 5 >= places.length ? 'End of list' : 'Next 5'}
                            </button>
                        </div>
                        {places.slice((currentPage - 1) * 5, currentPage * 5).map((place) => (
                            <PlaceCards place={place}
                                key={place.id}
                            />
                        ))
                        }

                    </>
                    :
                    null}
            </APIProvider >
            :
            <div>Loading map data...</div>

    )
}

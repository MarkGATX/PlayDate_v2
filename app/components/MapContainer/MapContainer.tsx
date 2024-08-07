'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { fetchNearbyPlaces } from "@/utils/map/nearbyPlacesAPI";
import { placesDataTypeWithExpiry, placesDataType } from "@/utils/types/placeTypeDefinitions";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { APIProvider, AdvancedMarker, InfoWindow, Map, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useContext, useEffect, useState } from "react";
import { goodWeatherCodes } from "@/utils/map/activityTypes";
import { goodWeatherActivity } from "@/utils/map/activityTypes";
import { badWeatherActivity } from "@/utils/map/activityTypes";
import PlaceCards from "../PlaceCards/PlaceCards";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import supabaseClient from "@/utils/supabase/client";

export default function MapContainer() {
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    const [places, setPlaces] = useState<placesDataType[] | undefined>()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)
    const {user} = useContext(AuthContext)

    useEffect(() => {
        
            const getCurrentUser = async () => {
                console.log('run get Current User from dash')
                // getCachedUser()
                try {
                    const firebase_uid = user?.uid
                    if (!firebase_uid) {
                        return
                    }
                    const { data: adultData, error: adultError } = await supabaseClient
                        .from('Adults')
                        .select('*') // Select only the ID for efficiency
                        .eq('firebase_uid', firebase_uid);
                    if (adultError) {
                        throw adultError;
                    }
                    if (adultData) {
                        setCurrentUser(adultData[0])
    
                        const { data: kidsJoinData, error: kidsJoinDataError } = await supabaseClient
                            .from('Adult_Kid')
                            .select('kid_id')
                            .eq('adult_id', adultData[0].id)
    
                        console.log('KIDS JOIN DATA IN MAP: ', kidsJoinData)
                        if (kidsJoinDataError) {
                            throw kidsJoinDataError;
                        }
                        if (kidsJoinData) {
                            //map kidsJoinData into array to use .in method
                            const kidIds = kidsJoinData.map(kidJoin => kidJoin.kid_id);                           
                            const { data: kidsData, error: kidsDataError } = await supabaseClient
                                .from('Kids')
                                .select('first_name, last_name, id')
                                .in('id', kidIds);
                            if (kidsDataError) {
                                throw kidsDataError;
                            }
                            if (kidsData) {
                                console.log(kidsData)
                                setCurrentUser({
                                    ...adultData[0],
                                    Kids: kidsData,
                                })
                            }
                        }
                        
                        // }
    
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        

        const getPlaces = async () => {
            try {
                const activityTypes = goodWeatherCodes.includes(currentWeather.weatherData?.current_icon || 0)
                    ? goodWeatherActivity
                    : badWeatherActivity;
                // check for accurate types. placesDataTypeWithExpiry doesn't work
                let placesData
                const storedPlacesData = localStorage.getItem('placesData')
                if (storedPlacesData) {
                    // Get the data from local storage
                    placesData = JSON.parse(storedPlacesData);
                    console.log(placesData.expiryDate, Date.now(), placesData.expiryDate > Date.now())
                    if (placesData.expiryDate > Date.now()) {
                        console.log(placesData)
                        console.log('local storage places', placesData)
                        setPlaces(placesData.places)
                    } else {
                        localStorage.removeItem('placesData')
                        placesData = await fetchNearbyPlaces(activityTypes, currentLocation.latitude, currentLocation.longitude);
                        // Store the places in local storage
                        console.log('fetched places', placesData)
                        setPlaces(placesData)
                    }
                } else {
                    //get the data from Google Places
                    placesData = await fetchNearbyPlaces(activityTypes, currentLocation.latitude, currentLocation.longitude);
                    // Store the places in local storage
                    console.log('fetched places', placesData)
                    setPlaces(placesData)
                }
            } catch (error: any) {
                setError(error)
            }
        }
        getPlaces();
        getCurrentUser();

    }, [currentLocation, currentWeather, user])

    if (error) {
        return (
            <div> There was an error getting your map data: {error}</div>
        )
    }

    console.dir(currentUser)
    return (
        (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API && currentLocation.latitude != 0 && currentLocation.longitude != 0) ?
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}>
                {/* <div>{currentLocation.latitude} {currentLocation.longitude}</div> */}
                <Map
                    style={{ width: '100vw', height: '40dvh', marginBottom: '2rem' }}
                    defaultCenter={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                    defaultZoom={12}
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
                                    onClick={() => document.getElementById(place.id)?.scrollIntoView({ behavior: 'smooth' })}
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
                                kids={currentUser?.Kids}
                                currentUserID={currentUser?.id}
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

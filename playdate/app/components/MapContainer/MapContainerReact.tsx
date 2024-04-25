'use client'
import { LocationContext } from "@/utils/location/LocationContext";
import { fetchNearbyPlaces, placesDataType } from "@/utils/map/googlePlacesAPI";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import { APIProvider, InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";
import { useContext, useEffect, useState } from "react";
import { goodWeatherCodes } from "@/utils/map/activityTypes";
import { goodWeatherActivity } from "@/utils/map/activityTypes";
import { badWeatherActivity } from "@/utils/map/activityTypes";
import PlaceCards from "../PlaceCards/PlaceCards";

export default function MapContainerReact() {
    const [error, setError] = useState<string | null>(null);
    const [mapMarkers, setMapMarkers] = useState(null)
    const [places, setPlaces] = useState<placesDataType[] | undefined>()
    const currentLocation = useContext(LocationContext)
    const currentWeather = useContext(WeatherContext)

    useEffect(() => {
        const getPlaces = async () => {
            try {
                const activityTypes = goodWeatherCodes.includes(currentWeather.weatherData?.current_icon || 0)
                    ? goodWeatherActivity
                    : badWeatherActivity;
                const placesData = await fetchNearbyPlaces(activityTypes);
                setPlaces(placesData.places)
                console.log(placesData.places)
            } catch (error: any) {
                setError(error)
            }
        }
        getPlaces();
    }, [currentWeather, currentWeather])

    if (error) {
        return (
            <div> There was an error getting your map data: {error}</div>
        )
    }

    return (
        (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API && currentLocation.latitude != 0 && currentLocation.longitude != 0) ?
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}>
                <div>{currentLocation.latitude} {currentLocation.longitude}</div>
                <Map
                    style={{ width: '100dvw', height: '40dvh', marginBottom: '2rem' }}
                    defaultCenter={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                    defaultZoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                >
                    {places ?
                        places.map((place) => (

                            <Marker key={place.id}
                                position={{ lat: place.location.latitude, lng: place.location.longitude }}
                                title={place.displayName.text} />

                        ))
                        :
                        null
                    }
                </Map>
                {places ?
                    places.map((place) => (
                        <PlaceCards place={place} key={place.id}/>
                    ))
                    :
                    null}

            </APIProvider>

            :
            <div>Loading map data...</div>

    )
}

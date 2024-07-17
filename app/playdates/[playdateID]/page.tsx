'use client'

import supabaseClient from "@/utils/supabase/client"
import { placesDataType, placesDataTypeWithExpiry } from "@/utils/types/placeTypeDefinitions"
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function PlaydateDetails() {
    const params = useParams<{ playdateID: string }>()
    const [playdateInfo, setPlaydateInfo] = useState<PlaydateType>()
    const [placeDetails, setPlaceDetails] = useState<placesDataType>()

    useEffect(() => {
        const getPlaydateInfo = async () => {
            try {
                const { data: playdateData, error: playdateDataError } = await supabaseClient
                    .from('Playdates')
                    .select('*') // Select only the ID for efficiency
                    .eq('id', params.playdateID);
                if (playdateDataError) {

                    throw playdateDataError;
                }
                if (playdateData) {
                    console.dir(playdateData)
                    setPlaydateInfo(playdateData[0])
                    //get location data
                    // check for location in local storage first
                    const localStoragePlaces = localStorage.getItem('placesData');
                    const placesData: placesDataTypeWithExpiry = localStoragePlaces ? JSON.parse(localStoragePlaces) : [];
                    console.log(placesData)
                    const selectedPlace = placesData.places.find(
                        (place: placesDataType) => place.id === playdateInfo?.location
                    );

                    console.log(!selectedPlace);
                    if (selectedPlace) {
                        setPlaceDetails(selectedPlace)
                    } 
                    if (!selectedPlace || selectedPlace === undefined) {
                        
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        getPlaydateInfo()
    }, [params])

    return (
        <main>
            <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                <h1 className='font-bold text-xl'>Playdate</h1>
                <p>{playdateInfo?.host_id}</p>
            </div>
        </main>
    )
}
'use client'

import KidSearchResults from "@/app/components/KidSearchResults/KidSearchResults"
import KidSearchResultsSuspense from "@/app/components/KidSearchResults/KidSearchResultsSuspense"
import { fetchPlaceData } from "@/utils/actions/playdateActions"
import { AuthContext } from "@/utils/firebase/AuthContext"
import supabaseClient from "@/utils/supabase/client"
import { placesDataType, placesDataTypeWithExpiry } from "@/utils/types/placeTypeDefinitions"
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions"
import { AdultsType } from "@/utils/types/userTypeDefinitions"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Suspense, useContext, useEffect, useState } from "react"

export default function PlaydateDetails() {
    const params = useParams<{ playdateID: string }>()
    const [playdateInfo, setPlaydateInfo] = useState<PlaydateType>()
    const [placeDetails, setPlaceDetails] = useState<placesDataType>()
    const [playdateDay, setPlaydateDay] = useState<string>()
    const [playdateTime, setPlaydateTime] = useState<string>()
    const [kidSearchTerm, setKidSearchTerm] = useState<string>('')
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    const {user} = useContext(AuthContext)

    useEffect(() => {
        const getPlaydateInfo = async () => {
            try {
                const { data: playdateData, error: playdateDataError } = await supabaseClient
                    .from('Playdates')
                    .select('*, Kids(first_name, last_name, first_name_only), Adults(first_name, last_name)') // Select only the ID for efficiency
                    .eq('id', params.playdateID);
                if (playdateDataError) {

                    throw playdateDataError;
                }
                if (playdateData) {
                    let playdateDateObject = new Date(playdateData[0].time)
                    // setPlaydateDay(playdateDateObject.toISOString().split('T')[0]) // "YYYY-MM-DD"
                    // setPlaydateTime(playdateDateObject.toTimeString().split(' ')[0].slice(0, 5)) // "HH:MM"
                    setPlaydateDay(playdateDateObject.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) // "YYYY-MM-DD"
                    setPlaydateTime(playdateDateObject.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })) // "HH:MM"
                    console.dir(playdateData)
                    // extract the Adults and Kids keys from the response to make the state object easier to read and navigate for clarity. Adults and Kids seems confusing since there will be only one host and one kid per playdate
                    const { Adults, Kids, ...remainingData } = playdateData[0];
                    const newPlaydateData = {
                        ...remainingData,
                        kid_name: {
                            first_name: Kids.first_name,
                            last_name: Kids.last_name
                        },
                        host_name: {
                            first_name: Adults.first_name,
                            last_name: Adults.last_name
                        },
                        kid_first_name_only: Kids.first_name_only
                    }

                    setPlaydateInfo(newPlaydateData)
                    //get location data
                    // check for location in local storage first
                    const localStoragePlaces = localStorage.getItem('placesData');
                    const placesData: placesDataTypeWithExpiry = localStoragePlaces ? JSON.parse(localStoragePlaces) : [];
                    console.log(placesData)
                    if (placesData?.places?.length > 0) {
                        const selectedPlace = placesData.places.find(
                            (place: placesDataType) => place.id === playdateData[0].location
                        );
                        console.log(!selectedPlace);
                        if (selectedPlace) {
                            setPlaceDetails(selectedPlace)
                        }
                    } else if (placesData?.places?.length === 0 || !placesData?.places?.length) {
                        const fetchPlaceDetails = await fetchPlaceData(playdateData[0].location)
                        console.log(fetchPlaceDetails)
                        setPlaceDetails(fetchPlaceDetails)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        getPlaydateInfo()
    }, [params])

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

                    const { data: notificationData, error: notificationError } = await supabaseClient
                        .from('Notifications')
                        .select('*')
                        .eq('receiver_id', adultData[0].id)


                    setCurrentUser({
                        ...adultData[0],
                        Notifications: notificationData,
                    })
                    // }

                }
            } catch (error) {
                console.log(error)
            }
        }

        getCurrentUser();

    }, [user])

    console.log(playdateInfo)
    return (
        <main>

            {playdateInfo && placeDetails
                ?
                <>
                    <div id='playdateHeader' className='w-full bg-appBlue text-appBG p-4 flex flex-col items-center gap-0 justify-center'>
                        <h1 className='font-bold text-xl'>{`Playdate at`}  <Link href={`/place/${placeDetails.id}`} className='underline'>{`${placeDetails.displayName.text}`}</Link></h1>
                        <h1>{`with ${playdateInfo.kid_name.first_name}`} {playdateInfo.kid_first_name_only ? null : `${playdateInfo.kid_name.last_name}`} </h1>
                    </div>
                </>
                :
                <>
                    <div id='playdateHeader' className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                        <h1 className='font-bold text-xl'>Loading your playdate...</h1>
                    </div>

                </>
            }
            {playdateInfo && placeDetails
                ?
                <>
                    <section id='playdateLocationInfo' className='w-full flex flex-col items-center'>
                        <div id='playdateLocationImageContainer' className='w-full relative h-72'>
                            <Image src={`https://places.googleapis.com/v1/${placeDetails.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`} alt={`pic of ${placeDetails?.displayName.text}`} fill={true} style={{ objectFit: 'cover' }}>
                            </Image>
                            {placeDetails.photos[0].authorAttributions[0].displayName
                                ?
                                <a href={`${placeDetails.photos[0].authorAttributions[0].uri}`} target="_blank"><p className='z-10 absolute text-appGold text-xs p-1 bg-appBlueTrans'>Image by {placeDetails.photos[0].authorAttributions[0].displayName}</p></a>
                                :
                                null
                            }
                        </div>
                        <h2 className='text-lg font-bold w-full text-center px-4'>{playdateDay}, {playdateTime}</h2>
                        <p className='w-full px-4 text-center'><a href=''></a>{placeDetails.formattedAddress}</p>
                        {/* This url only opens a map without directions. The live anchor opens a map with directions but based solely on lat and long, which may show a different location name */}
                        {/* <a href={`https://www.google.com/maps/place/?q=place_id:${placeDetails.id}&travel_mode`} target="_blank"> */}
                        <a href={`https://www.google.com/maps/dir/?api=1&origin=my+location&destination=${placeDetails.location.latitude},${placeDetails.location.longitude}&travelmode=driving`} target="_blank">

                            <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Get Directions</button>
                        </a>
                    </section>


                </>
                :
                <>
                    <div className='w-full p-4 flex justify-center'>
                        <h1 className=''>Loading your location details...</h1>
                    </div>

                </>
            }
            {playdateInfo && placeDetails && currentUser?.id === playdateInfo.host_id
                ?
                <section id='inviteKidsSection' className='p-4'>
                    <h3 className='font-bold'>Search for kids to invite...</h3>
                    <input type='text' value={kidSearchTerm} placeholder={`Kid's name`} className='border-2 rounded-lg px-2 bg-inputBG  ' onChange={(event) => { setKidSearchTerm(event.target.value) }}></input>
                    <Suspense fallback={<KidSearchResultsSuspense />}>
                        <KidSearchResults searchType='inviteToPlaydate' currentUser={currentUser} searchTerm={kidSearchTerm} playdateInfo={playdateInfo}/>
                    </Suspense>
                </section>
                :
                null}
        </main>
    )
}
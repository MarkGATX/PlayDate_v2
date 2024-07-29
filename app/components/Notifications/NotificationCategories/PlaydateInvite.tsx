import { fetchPlaceData } from "@/utils/actions/playdateActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions";
import { placesDataType } from "@/utils/types/placeTypeDefinitions";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PlaydateInvite({ notification, index }: { notification: NotificationDetailsType, index: number }) {
    const [playdatePlaceDetails, setPlaydatePlaceDetails] = useState<placesDataType>()
    const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false)
    const [playdateDay, setPlaydateDay] = useState<string>()
    const [playdateTime, setPlaydateTime] = useState<string>()

    useEffect(() => {
        let playdateDateObject = new Date(notification.playdate_time)
        // setPlaydateDay(playdateDateObject.toISOString().split('T')[0]) // "YYYY-MM-DD"
        // setPlaydateTime(playdateDateObject.toTimeString().split(' ')[0].slice(0, 5)) // "HH:MM"
        setPlaydateDay(playdateDateObject.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) // "YYYY-MM-DD"
        setPlaydateTime(playdateDateObject.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })) // "HH:MM"

        const getPlaydatePlaceInfo = async () => {
            if (!notification.playdate_location) {
                return
            }
            const fetchPlaceDetails = await fetchPlaceData(notification.playdate_location)
            console.log(fetchPlaceDetails)
            setPlaydatePlaceDetails(fetchPlaceDetails)
        }
        getPlaydatePlaceInfo();
        console.log(playdatePlaceDetails)

    }, [notification, playdatePlaceDetails])

    const handleShowMoreInfo = async () => {
        setShowMoreDetails(true)
    }

    return (
        <>
            <section id={`singleNotificationContainer${notification.id}${index}`} className='bg-inputBG rounded-lg p-2 flex flex-col gap-4'>
                <div className='w-full flex gap-w justify-between'>
                    <div id={`parentProfilePicContainer${notification.sender.id}${index}`} className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.sender.profilePicURL || '/pics/generic_profile_pic.webp'} alt="parent's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <div id={`notificationMessageContainer${notification.id}${index}`} className='text-sm w-2/3 text-center'>
                        <span className='font-bold'>{notification.sender.first_name} {notification.sender.last_name}</span> invites you to a playdate with <span className='font-bold'>{notification.kid.first_name} {notification.kid.first_name_only ? null : notification.kid.last_name}</span>
                    </div>
                    <div id={`senderProfilePicContainer${notification.id}${index}`} className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.kid.profile_pic || '/pics/generic_profile_pic.webp'} alt="sender's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>
                    </div>
                </div>
                <hr className='border-1 border-appBlue' />
                <div id={`morePlaydateInfo${notification.id}${index}`} className='flex justify-start gap-4 items-center text-sm' >
                    {playdatePlaceDetails ?
                        <>
                            <div className='w-9 h-9 flex justify-center relative'>
                                <Image src={`https://places.googleapis.com/v1/${playdatePlaceDetails.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`} fill={true} alt={`Image of ${playdatePlaceDetails.displayName.text}`} style={{ objectFit: 'cover' }} className='w-20 rounded' />
                            </div>
                            <div>
                                <h3>{playdatePlaceDetails.displayName.text}</h3>
                                <p>{playdateDay} at {playdateTime}</p>
                            </div>
                        </>
                        :
                        null
                    }
                </div>
                <div id={`requestResponseButtons${notification.id}${index}`} className="w-full flex justify-around gap-4">
                    <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleShowMoreInfo}>More Info...</button>
                    <button className='px-1 w-20 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Yes</button>
                    <button className='px-1 w-20 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >No</button>
                    <button className='px-1 w-20 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Maybe</button>
                </div>

                {/* {errorMessage
                    ?
                    <section id='errorMessageContainer' className='text-red-700'>
                        {errorMessage}
                    </section>
                    :
                    null
                } */}
            </section >

        </>
    )
}
import { addKidRequestNotification } from "@/utils/actions/notificationActions";
import { inviteKidToPlaydate } from "@/utils/actions/playdateActions";
import supabaseClient from "@/utils/supabase/client";
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions";
import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";


export default function KidSearchCard({ kidData, searchType, currentUserId, playdateInfo,  }: { kidData: KidsType, searchType: string, currentUserId: string, playdateInfo?:PlaydateType }) {
    console.log(currentUserId)
    const [notificationExists, setNotificationExists] = useState<boolean>(false)

    // useEffect(() => {
    //     const checkNotificationExists = async () => {
    //         const { data, error } = await supabaseClient
    //             .from('Notifications')
    //             .select('*')
    //             .eq('kid_id', kidData.id)
    //             .eq('sender_id', currentUserId)
    //             .eq('notification_type', 'Add kid request')
    //         if (error) {
    //             console.error('Error fetching notification:', error);
    //             return;
    //         }
    //         if (data.length>0) {
    //             console.log('Notification exists:', data);
    //             setNotificationExists(true)
    //         } else {
    //             console.log('No existing notification found.');
    //             setNotificationExists(false)
    //         }
    //     };
    //     checkNotificationExists();
    // }, [currentUserId])

    const handleAddKidRequest = async () => {
        try {
            const addRequest = await addKidRequestNotification(currentUserId, kidData.primary_caregiver, kidData.id)
            console.log(addRequest)
            if (addRequest) {
                setNotificationExists(true)
            }
        } catch (error) {

        }
    }

    const handleInviteKid = async () => {
        if (!playdateInfo) {
            console.log('no playdate info')
            return
        }
        try {
            const kidInvite = await inviteKidToPlaydate(kidData.id, kidData.primary_caregiver, playdateInfo)
            console.log('KID INVITE: ', kidInvite)
            if (kidInvite) {
                setNotificationExists(true)
            }
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div id='kidSearchResultCard' className='h-48 border-2 rounded border-appBlue mx-2 mt-2 w-32 p-2 bg-appBG flex flex-col items-center justify-between'>
            <div className='flex justify-center flex-col items-center gap-2'>
                <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 bg-appBG overflow-hidden '>
                    <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                </div>
                <h2 className='text-center text-xs'>{kidData.first_name} {kidData.first_name_only ? null : kidData.last_name}</h2>
            </div>
            {(() => {
                switch (searchType) {
                    case ('addKidToParent'):
                        return (
                            kidData.primary_caregiver === currentUserId
                                ?
                                <p className='text-xs w-full text-center'>Primary Caregiver</p>
                                :
                                // notificationExists ?
                                //     <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Request already sent</button>
                                //     :
                                <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' onClick={handleAddKidRequest}>Request add</button>
                        );
                    case ('inviteToPlaydate'):
                        return (
                            kidData.primary_caregiver === currentUserId
                                ?
                                null
                                :
                                // notificationExists ?
                                //     <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Request already sent</button>
                                //     :
                                <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' onClick={handleInviteKid}>Invite</button>
                        );
                    default:
                        null;
                }
            })()
            }
        </div>
    )
}
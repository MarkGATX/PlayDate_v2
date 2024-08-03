'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { Suspense, useContext, useEffect, useState } from "react";
import supabaseClient from "@/utils/supabase/client";
import KidsCard from "../components/KidsCard/KidsCard";
import { useGSAP } from "@gsap/react";
import DashboardAdultInfo from "../components/DashboardAdultInfo/DashboardAdultInfo";
import DashboardNewKidsInfo from "../components/DashboardNewKidsInfo/DashboardNewKidsInfo";
import Notification from "../components/Notifications/Notification";
import NotificationSuspense from "../components/Notifications/NotificationSuspense";
import DashboardKidsSection from "../components/DashboardKidsSection/DashboardKidsSection";
import DashboardKidsSectionSuspense from "../components/DashboardKidsSection/DashboardKidsSectionSuspense";
import DashboardPlaydateSection from "../components/DashboardPlaydateSection/DashboardPlaydateSection";


export type kidsArray = {
    kidsRawData?: KidsType[]
}

export type newKidFormErrorType = {
    firstNameError?: string
    lastNameError?: string
    birthdayError?: string
    profilePicError?: string
}

export default function Dashboard() {

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState<string | undefined>()
    const { user } = useContext(AuthContext)
    const [currentUser, setCurrentUser] = useState<AdultsType>()

    //set context for gsap cleanups
    const { contextSafe } = useGSAP();

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

    console.log(currentUser)

    return (
        <main>
            <Suspense fallback={<div className='w-full bg-appBlue text-appBG p-4 flex justify-center'><h1 className='font-bold text-xl'>Loading your data...</h1></div>}>
                <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                    <h1 className='font-bold text-xl'>Dashboard</h1>
                </div>
                {!currentUser
                    ?
                    <>
                        <div className='w-full  p-4 '>You need to be logged in to see this page.</div>
                    </>
                    :
                    <>
                        <DashboardAdultInfo user={currentUser} />
                        <DashboardPlaydateSection adultData={currentUser} />
                        <Suspense fallback={<DashboardKidsSectionSuspense />}>
                            <DashboardKidsSection adultData={currentUser} />
                        </Suspense>

                        <Suspense fallback={<NotificationSuspense />}  >
                            <Notification currentUser={currentUser} />
                        </Suspense>

                    </>

                }
            </Suspense>
        </main >
    )
}
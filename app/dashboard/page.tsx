'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { Suspense, useContext, useEffect, useState } from "react";
import supabaseClient from "@/utils/supabase/client";
import KidsCard from "../components/KidsCard/KidsCard";
import { useGSAP } from "@gsap/react";
import DashboardAdultInfo from "../components/DashboardAdultInfo/DashboardAdultInfo";
import DashboardNewKidsInfo from "../components/DashboardNewKidsInfo/DashboardNewKidsInfo";
import Notification from "../Notifications/Notification";
import NotificationSuspense from "../Notifications/NotificationSuspense";
import DashboardKidsSection from "../components/DashboardKidsSection/DashboardKidsSection";
import DashboardKidsSectionSuspense from "../components/DashboardKidsSection/DashboardKidsSectionSuspense";

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
    const [reRenderEffect, setReRenderEffect] = useState<boolean>(false)
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
                    // const kidIds = adultData[0].Adult_Kid.map((akData: any) => akData.kid_id);
                    // console.dir(kidIds)
                    // const { data: kidsData, error: kidsError } = await supabaseClient
                    //     .from('Kids')
                    //     .select('*')
                    //     .in('id', kidIds)
                    // console.log(kidsData)
                    const { data: notificationData, error: notificationError } = await supabaseClient
                        .from('Notifications')
                        .select('*')
                        .eq('receiver_id', adultData[0].id)
                    // if (notificationError) {
                    //     throw notificationError
                    // }
                    // if (kidsError) {
                    //     throw kidsError;
                    // }
                    // if (kidsData && !notificationData) {
                    //     console.log('run kids into user')
                    //     setCurrentUser({
                    //         ...adultData[0],
                    //         Kids: kidsData,
                    //     });
                    //     console.log(currentUser)
                    // } else if (notificationData && !kidsData) {
                    //     setCurrentUser({
                    //         ...adultData[0],
                    //         Notifications: notificationData,
                    //     });
                    // } else {

                        setCurrentUser({
                            ...adultData[0],
                            Notifications: notificationData,
                            // Kids: kidsData
                        })
                    // }

                }
            } catch (error) {
                console.log(error)
            }
        }
        getCurrentUser();
    }, [user, reRenderEffect])

    console.log(currentUser)

    return (
        <main>
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
                    <DashboardAdultInfo user={currentUser} reRender={setReRenderEffect} />
                    <section id='kidsSection' className='w-full p-4 flex flex-col gap-4'>
                        <Suspense fallback={<DashboardKidsSectionSuspense />}>
                            <DashboardKidsSection adultData={currentUser} />
                        </Suspense>

                        {/* Add kids forms */}
                        {currentUser?.id
                            ?
                            <DashboardNewKidsInfo currentUser={currentUser} reRender={setReRenderEffect} />
                            :
                            <div> You have to be logged in to do this</div>

                        }
                    </section>



                    <section id='notificationSection' className='w-full p-4'>
                        <h2 className='font-bold text-lg w-full'>Notifications:</h2>
                        {currentUser.Notifications && currentUser.Notifications.length > 0
                            ?
                            currentUser.Notifications.map((notification) => (
                                <Suspense key={notification.id} fallback={<NotificationSuspense />}  >
                                    <Notification key={notification.id} currentUser={currentUser} notification={notification} reRender={setReRenderEffect} />
                                </Suspense>
                            ))

                            :
                            <p>No notifications</p>
                        }

                    </section>
                </>

            }
        </main >
    )
}
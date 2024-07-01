'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { useContext, useEffect, useState } from "react";
import supabaseClient from "@/utils/supabase/client";

import KidsCard from "../components/KidsCard/KidsCard";
import { useGSAP } from "@gsap/react";
import DashboardAdultInfo from "../components/DashboardAdultInfo/DashboardAdultInfo";
import DashboardKidsInfo from "../components/DashboardKidsInfo/DashboardKidsInfo";

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
                    .select('*, Adult_Kid (*)') // Select only the ID for efficiency
                    .eq('firebase_uid', firebase_uid);
                if (adultError) {
                    throw adultError;
                }
                if (adultData) {
                    const kidIds = adultData[0].Adult_Kid.map((akData: any) => akData.kid_id);
                    console.dir(kidIds)
                    const { data: kidsData, error: kidsError } = await supabaseClient
                        .from('Kids')
                        .select('*')
                        .in('id', kidIds)
                    if (kidsError) {
                        throw kidsError;
                    }
                    if (kidsData) {
                        setCurrentUser({
                            ...adultData[0],
                            Kids: kidsData,
                        });
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        getCurrentUser();
    }, [user, reRenderEffect])

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
                    <DashboardAdultInfo user={currentUser} reRender={setReRenderEffect}/>

                    <section id='kidsSection' className='w-full p-4 flex flex-col gap-4'>
                        <h2 className='font-bold text-lg w-full'>Kids:</h2>
                        {currentUser && currentUser?.Kids.length > 0
                            ?
                            currentUser.Kids.map((kid) => (
                                <KidsCard key={kid.id} kid={kid} currentUser={currentUser.id} />
                            ))
                            :
                            null
                        }
                        {/* Make sure currentUser is true before rendering add kid form */}
                        {currentUser?.id
                            ?
                            <DashboardKidsInfo currentUser={currentUser} kids={currentUser.Kids} reRender={setReRenderEffect} />
                            :
                            <div> You have to be logged in to do this</div>

                        }


                    </section>
                    <section id='notificationSection' className='w-full p-4'>
                        <h2 className='font-bold text-lg w-full'>Notifications:</h2>
                    </section>
                </>

            }
        </main>
    )
}
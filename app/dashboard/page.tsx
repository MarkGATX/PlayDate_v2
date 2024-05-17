'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { createClient } from "@supabase/supabase-js";
import { AddKid } from "@/utils/actions/actions";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useFormState } from "react-dom";

export default function Dashboard() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState<string | undefined>()
    // const [state, dispatch] = useFormState(AddKid, initialState);
    const { user } = useContext(AuthContext)
    const [currentUser, setCurrentUser] = useState<AdultsType | undefined>(undefined)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Missing Supabase URL or API key');
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    // const params = useParams();
    // console.log(params.user_id)

    // useEffect(() => {
    //     if (user) {
    //         setFirebaseUid(user.uid)
    //     }
    //     // Check user authorization if firebase_uid is available
    //     if (firebaseUid && firebaseUid !== params.user_id) {
    //         setIsAuthorized(false);
    //     } else {
    //         setIsAuthorized(true);
    //     }
    // }, [params.firebase_uid, user]); // Dependency array for useEffect



    useEffect(() => {
        const getCurrentUser = async () => {
            const firebase_uid = user?.uid
            if (!firebase_uid) {
                return <div>You need to be logged in to see this page.</div>;
            }
            const { data, error } = await supabase
                .from('Adults')
                .select('*') // Select only the ID for efficiency
                .eq('firebase_uid', firebase_uid);
            if (data) {
                setCurrentUser(data[0])
            }
        }
        getCurrentUser();
    }, [user, supabase])

    if (!user) {
        return (
            <main>
                <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                    <h1 className='font-bold text-xl'>Dashboard</h1>
                </div>
                <div className='w-full  p-4 '>You need to be logged in to see this page.</div>
            </main>
        )
    }

    return (
        <main>
            <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                <h1 className='font-bold text-xl'>Dashboard</h1>
            </div>
            <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4'>
                <div id='profileName' className='w-7/12'>
                    <h2 className='font-bold text-lg'>
                        {currentUser?.first_name} {currentUser?.last_name}
                    </h2>
                    <p className='text-sm'>{currentUser?.phone_number ? currentUser.phone_number : `No phone number`}</p>
                    <p className='text-sm'>{currentUser?.email ? currentUser.email : `No phone number`}</p>

                </div>
                <div id='profilePicContainer' className='flex flex-col items-center'>
                    <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                        <Image src={currentUser?.profilePicURL ? currentUser.profilePicURL : `/pics/generic_profile_pic.webp`} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                </div>
                <div id='profileOptions' className='w-full'>
                    <fieldset className='text-sm'>
                        <div className='block'>
                            <input type='checkbox' id='showPhoneNumberToggle' className='mr-2'></input><label htmlFor="showPhoneNumberToggle">Show phone number to connections</label>
                        </div>
                        <div className='block'>
                            <input type='checkbox' id='showLastNameToggle' className='mr-2'></input><label htmlFor="showLastNameToggle">Show e-mail to connections</label>
                        </div>
                    </fieldset>
                </div>

            </section>
            <section id='kidsSection' className='w-full p-4'>
                <h2 className='font-bold text-lg w-full'>Kids:</h2>
                <div className='singleKid flex flex-col bg-inputBG rounded-xl p-2 gap-4'>
                    <div className='flex justify-between items-start gap-4 w-full '>
                        <div id='kidProfilePicContainer' className='flex flex-col w-1/4 items-center justify-start'>
                            <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                                <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                            </div>
                            <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                        </div>
                        <div className='w-3/4 flex flex-col gap-y-1'>
                            <p className='w-full'>{`Kid's name`}</p>
                            <div className='block w-full text-xs'>
                                <input type='checkbox' id='showLastNameToggle' className='mr-2'></input><label htmlFor="showLastNameToggle">First name only</label>
                            </div>
                            <div className='block w-full text-xs'>
                                <label htmlFor="showLastNameToggle" className='mr-2'>Birthday</label><input type='date' id='showLastNameToggle' className='w-4/6 rounded'></input>
                            </div>
                        </div>
                    </div>
                    <div className='w-full'>
                        <p className='text-sm'>Parents: parent names</p>
                        <p className='text-sm'>Caregivers: caregiver names</p>
                        <div className='flex justify-between w-full my-4'>
                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Parent</button>
                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Caregiver</button>
                        </div>
                    </div>
                </div>
                <div id='newKidForm' className=''>
                    <form action={AddKid} className='flex justify-between flex-wrap'>
                        <div className='pt-2 pb-1 flex justify-between w-full items-center'>
                            <label htmlFor="kidsFirstNameInput" className='text-sm w-1/3'>First Name</label><input id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                        </div>
                        <div className='py-1 flex justify-between w-full items-center'>
                            <label htmlFor="kidsLastNameInput" className='text-sm w-1/3'>Last Name</label><input id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                        </div>
                        <div className='py-1 flex justify-between w-full items-center'>
                            <label htmlFor="kidsBirthdayInput" className='text-sm w-1/3'>Birthday</label><input id='kidsBirthdayInput' name='birthday' type="date" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                        </div>
                        <div className='py-1'>
                            <label htmlFor="kidsShowLastNameInput" className='text-sm w-1/2'>Show First Name Only</label><input id='kidsShowLastNameInput' type="checkbox" name='first_name_only' className='rounded border-2 border-appBlue p-1 text-sm ml-2 '></input>
                        </div>
                        <button type='submit'>Save New Kid</button>
                    </form>
                </div>
                <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Add New Kid</button>
            </section>
            <section id='notificationSection' className='w-full p-4'>
                <h2 className='font-bold text-lg w-full'>Notifications:</h2>
            </section>
        </main>
    )
}
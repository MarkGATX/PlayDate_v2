'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Dashboard() {
    const { user } = useContext(AuthContext)

    // const params = useParams();
    // console.log(params.firebase_uid)
    // // State flag for potential authorization error
    // const [isAuthorized, setIsAuthorized] = useState(true);

    // useEffect(() => {
    //     // Check user authorization if firebase_uid is available
    //     if (params.firebase_uid && user?.uid !== params.firebase_uid) {
    //         setIsAuthorized(false);
    //     } else {
    //         setIsAuthorized(true);
    //     }
    // }, [params.firebase_uid, user]); // Dependency array for useEffect

    // if (!isAuthorized) {
    //     return <div>You are not authorized to see this page.</div>;
    // }

    return (
        <main>
            <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                <h1 className='font-bold text-xl'>Parent Dashboard</h1>
            </div>
            <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4'>
                <div id='profileName' className='w-7/12'>
                    <h2 className='font-bold text-lg'>
                        Parent Name
                    </h2>
                    <p className='text-sm'>555-555-5555</p>
                    <p className='text-sm'>something.com</p>

                </div>
                <div id='profilePicContainer' className='flex flex-col items-center'>
                    <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                        <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
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
                <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Add New Kid</button>
            </section>
            <section id='notificationSection' className='w-full p-4'>
                <h2 className='font-bold text-lg w-full'>Notifications:</h2>
            </section>
        </main>
    )
}
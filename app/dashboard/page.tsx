'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
// import { createClient } from "@supabase/supabase-js";
import { AddKid } from "@/utils/actions/actions";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import supabaseClient from "@/utils/supabase/client";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { PostgrestError } from "@supabase/supabase-js";
import gsap from "gsap";
import KidsCard from "../components/KidsCard/KidsCard";
import KidSearchResults from "../components/KidSearch/KidSearch";
import KidSearchResultsSuspense from "../components/KidSearchResults/KidSearchResultsSuspense";

export type kidsArray = {
    kidsRawData?: KidsType[]
}

export default function Dashboard() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState<string | undefined>()
    const { user } = useContext(AuthContext)
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    const [kidsData, setKidsData] = useState<kidsArray>();
    const [isLoadingKids, setIsLoadingKids] = useState(false);
    const [kidSearchTerm, setKidSearchTerm] = useState<string>('')
    const [newKidSectionOpen, setNewKidSectionOpen] = useState<boolean>(false)
    const router = useRouter();
    const newKidFormRef = useRef<HTMLDivElement | null>(null);
    const newKidSectionRef = useRef<HTMLElement | null>(null)
    // Track kid data loading state
    console.log(currentUser)
    console.log(user)



    useEffect(() => {
        const getCurrentUser = async () => {
            console.log('run get Current User from dash')
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
    }, [user])

    const toggleNewKidForm = () => {
        console.log(newKidSectionRef)
        if (newKidSectionRef.current) {
            if (newKidSectionOpen) {
                gsap.to(newKidSectionRef.current, {
                    autoAlpha: 0,
                    height: '0',
                    duration: 0.5,
                    ease: 'power1.inOut',
                });
            } else {
                gsap.to(newKidSectionRef.current, {
                    autoAlpha: 1,
                    height: 'auto',
                    duration: 0.5,
                    ease: 'power1.inOut',
                });
            }
            setNewKidSectionOpen(previousValue => !previousValue)
        }
    }

    const handleSearchChange = (value:string) => {
        const newSearchTerm = value;
      
        // Debouncing logic:
        const timeoutId = setTimeout(() => {
          setKidSearchTerm(newSearchTerm);
        }, 500); // Adjust delay (in milliseconds) as needed
      
        // Cleanup function to clear the timeout when the component unmounts
        // or the search term changes before the timeout fires:
        return () => clearTimeout(timeoutId);
      };



    // useEffect(() => {
    //     const getKids = async () => {
    //         setIsLoadingKids(true); // Set loading state for kids
    //         try {
    //             const { data: kidsRawData, error: kidsRawError }: { data: kidsArray | null, error: PostgrestError | null } = await supabaseClient
    //                 .from('Adult_Kid')
    //                 .select('Kids (*)')
    //                 .eq('Adult_id', currentUser?.id); // Use adult ID only if fetched

    //             if (kidsRawError) {
    //                 throw kidsRawError;
    //             }

    //             setKidsData(kidsData);
    //         } catch (error) {
    //             console.error('Error fetching kids:', error);
    //             // Handle errors appropriately
    //         } finally {
    //             setIsLoadingKids(false); // Reset loading state
    //         }
    //     };
    //     getKids();
    // }, [currentUser]); // Dependency on adultData

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
                    <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4'>
                        <div id='profileName' className='w-7/12'>
                            <h2 className='font-bold text-lg'>
                                {currentUser?.first_name} {currentUser?.last_name}
                            </h2>
                            <p className='text-sm'>{currentUser?.phone_number ? currentUser.phone_number : `No phone number`}</p>
                            <p className='text-sm'>{currentUser?.email ? currentUser.email : `No phone number`}</p>
                            {/* add toggle later for editing inputs */}
                            {/* <input inputMode="email"></input> */}

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
                            <>
                                <section id='addNewKidSection' ref={newKidSectionRef} className='h-0 overflow-hidden rounded-xl p-2 opacity-0 border-2 border-appBlue'>
                                    <div>
                                        <h3 className='font-bold'>Search for kid...</h3>
                                        <input type='text' value={kidSearchTerm} placeholder={`Kid's name`} className='border-2 rounded-lg px-2 bg-inputBG  ' onChange={(event) => { setKidSearchTerm(event.target.value) }}></input>
                                        {/* <input type='text' value={kidSearchTerm} placeholder={`Kid's name`} className='border-2 rounded-lg px-2 bg-inputBG  ' onChange={(event) => handleSearchChange(event.target.value)}></input> */}
                                        <Suspense fallback={<KidSearchResultsSuspense />}>
                                            <KidSearchResults searchType='addKidToParent' searchTerm={kidSearchTerm} />
                                        </Suspense>
                                    </div>
                                    <h3 className='text-center w-full'>OR</h3>
                                    <div>
                                        <h3 className='font-bold'>Add new kid...</h3>
                                        <div id='newKidForm' ref={newKidFormRef}>
                                            <form action={AddKid} id='addNewKidForm' className='flex justify-between flex-wrap'>

                                                <input type="hidden" name='primary_caregiver' value={currentUser.id} />
                                                <div className='pt-2 pb-1 flex justify-between w-full items-center'>
                                                    <label htmlFor="kidsFirstNameInput" className='text-sm w-1/3'>First Name</label><input id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                                                </div>
                                                <div className='py-1 flex justify-between w-full items-center'>
                                                    <label htmlFor="kidsLastNameInput" className='text-sm w-1/3'>Last Name</label><input id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                                                </div>
                                                <div className='py-1 flex justify-between w-full items-center'>
                                                    <label htmlFor="kidsBirthdayInput" className='text-sm w-1/3'>Birthday</label><input id='kidsBirthdayInput' name='birthday' type="date" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3'></input>
                                                </div>
                                                <div className='py-1'>
                                                    <label htmlFor="kidsShowLastNameInput" className='text-sm w-1/2'>Show First Name Only</label><input id='kidsShowLastNameInput' type="checkbox" name='first_name_only' className='rounded border-2 border-appBlue p-1 text-sm ml-2 '></input>
                                                </div>
                                                {/* <button type='submit' disabled={pending}>Save New Kid</button> */}
                                                <SubmitButton text='Save New Kid' />
                                            </form>
                                        </div>
                                    </div>
                                </section>
                            </>
                            :
                            <div> You have to be logged in to do this</div>

                        }

                        <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' onClick={toggleNewKidForm}>{newKidSectionOpen ? `Close form` : `Add New Kid`}</button>


                    </section>
                    <section id='notificationSection' className='w-full p-4'>
                        <h2 className='font-bold text-lg w-full'>Notifications:</h2>
                    </section>
                </>

            }
        </main>
    )
}
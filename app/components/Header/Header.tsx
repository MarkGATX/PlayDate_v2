'use client'
import Image from "next/image";
import Weather from "../Weather/Weather";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { auth } from "@/utils/firebase/firebaseConfig";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { checkUser } from "@/utils/users/checkUser";
import { useRouter } from "next/navigation";
// import { AddNewUser } from "@/utils/users/addNewUser";
import { AdultsType, NewUserType } from "@/utils/types/userTypeDefinitions";
import supabaseClient from "@/utils/supabase/client";
import { getNotificationNumber } from "@/utils/actions/notificationActions";

export default function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
    const [userID, setUserID] = useState<string>()
    const [notificationNumber, setNotificationNumber] = useState<number | undefined>(0)

    const { user } = useContext(AuthContext)
    const router = useRouter();
    const handleGoogleLogin = async () => {

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        try {
            const result = await signInWithPopup(auth, provider)
            /* check for existing user and redirect to sign-up page if false */
            if (result.user) {
                const names: string[] = result.user?.displayName?.split(' ') || [];
                const first_name = names[0] || '';
                const last_name = names[1] || '';
                const newUserData: NewUserType = {
                    first_name: first_name,
                    last_name: last_name,
                    email: result.user.email,
                    profilePicURL: result.user.photoURL,
                    firebase_uid: result.user.uid,

                }
                const existingUser = await checkUser(newUserData);
                if (existingUser) {
                    router.push(`/dashboard`)
                }
            }
            /* close mobile menu */
            showMobileMenu ? setShowMobileMenu(previousValue => !previousValue) : null
        } catch (error) {
            console.error(error)
        }
    }

    const handleGoogleLogout = async () => {
        try {
            await signOut(auth);
            showMobileMenu ? setShowMobileMenu(previousValue => !previousValue) : null
            router.push('/')
        } catch (error) {
            console.error(error)
        }
    }

    // useEffect(() => {

    //     const fetchNotificationNumber = async (userIdData: string) => {
    //         const rawNotificationNumber = await getNotificationNumber(userIdData)
    //         console.log(rawNotificationNumber)

    //         setNotificationNumber(rawNotificationNumber)
    //     }

    //     const getUserID = async () => {
    //         try {
    //             const { data: userIdData, error: userIdDataError } = await supabaseClient
    //                 .from('Adults')
    //                 .select('id')
    //                 .eq('firebase_uid', user?.uid)

    //             if (userIdDataError) {
    //                 console.error('Error fetching user ID:', userIdDataError);
    //             }
    //             if (userIdDataError) {
    //                 console.error('Error fetching user ID:', userIdDataError);
    //             } else if (userIdData && userIdData.length > 0) {
    //                 setUserID(userIdData[0].id)
    //                 fetchNotificationNumber(userIdData[0].id)
    //             } else {
    //                 console.log('No user ID found for the given UID:', user?.uid);
    //             }
    //         } catch (error) {
    //             console.error(error)
    //             getUserID();
    //         }

    //     }

        //two listeners with same events may cause
        // const notificationSubscription = supabaseClient
        //     .channel('public')
        //     .on(
        //         'postgres_changes',
        //         {
        //             event: '*',
        //             schema: 'public',
        //             table: 'Notifications',
        //             filter: `receiver_id=eq.${userID}`
        //         },
        //         (payload) => {
        //             //refetch notifications
        //             fetchNotificationNumber(userID || '');

        //         })
        //     .subscribe();

        // console.log(notificationSubscription)

        // getUserID();

        // return () => {
        //     supabaseClient.removeChannel(notificationSubscription)
        // }

    // }, [user])



    return (
        <>
            <header className="w-full pt-4 pr-4 pl-4 flex flex-col justify-between gap-3 overflow-hidden z-10">
                <div className='w-full flex justify-between'>
                    <Link href='/' className='w-40'>
                        <Image
                            src="/logos/playdate_logo.webp"
                            alt='Playdate logo'
                            width={150}
                            height={32}
                            className=''>
                        </Image>
                    </Link>
                    <nav className='flex'>
                        <div >
                            <Image className='cursor-pointer' src='/icons/hamburger_icon.webp' height={32} width={32} alt='menu icon' onClick={() => setShowMobileMenu(previousValue => !previousValue)}></Image>
                            {/* To eventually add notification button */}
                            {notificationNumber && notificationNumber > 0
                                ?
                                <p className='absolute top-2 right-2 text-xs min-w-5 rounded-full min-h-5 bg-appGold text-center  border-appBlue border-2 cursor-pointer' onClick={() => setShowMobileMenu(previousValue => !previousValue)}>{notificationNumber}</p>
                                :
                                null
                            }
                        </div>
                        <div id='mobileMenuContainer' className={`w-5/12 min-h-26 min-w-26 absolute border-t-2 border-l-2 border-b-2 border-appBlue rounded-l p-4 bg-appGold transition-all duration-500 top-12 z-10 right-0 ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                            <ul className='flex flex-col'>
                                <Link href='/' onClick={(() => setShowMobileMenu(previousValue => !previousValue))}>
                                    <li>Home</li>
                                </Link>
                                <Link href='/dashboard' onClick={(() => setShowMobileMenu(previousValue => !previousValue))}>
                                    <li>Dashboard</li>
                                </Link>
                                {user ?
                                    <li className='cursor-pointer' onClick={handleGoogleLogout}>Logout</li>
                                    :
                                    <li className='cursor-pointer' onClick={handleGoogleLogin}>Login</li>
                                }
                            </ul>
                        </div>
                    </nav>
                </div>
                <div id='weatherContainer' className='min-h-12 w-full'>

                    <Weather />
                </div>
            </header>
        </>
    )
}
'use client'
import Image from "next/image";
import Weather from "../Weather/Weather";
import Link from "next/link";
import { useContext, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { auth } from "@/utils/firebase/firebaseConfig";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { checkUser } from "@/utils/checkUser/checkUser";
import { useRouter } from "next/navigation";

export default function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
    const { user } = useContext(AuthContext)
    console.log(user)
    const router = useRouter();
    const handleGoogleLogin = async () => {
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        try {
        const result = await signInWithPopup(auth, provider)
        
            console.log(`successfully signed in: `, result)         
            /* check for existing user and redirect to sign-up page if false */
            if (result.user) {
                const existingUser = await checkUser(result.user.uid);
                existingUser ? null : router.push(`/create-user/${result.user.uid}`)
              }
              /* close mobile menu */
            showMobileMenu ? setShowMobileMenu(previousValue => !previousValue) : null
        } catch (error) {
            console.log(error)
        }
    }

    const handleGoogleLogout = async () => {
        try {
            await signOut(auth);
            showMobileMenu ? setShowMobileMenu(previousValue => !previousValue) : null
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <header className="w-full pt-4 pr-4 pl-4 flex flex-wrap justify-between gap-3">
                <Link href='/'>
                    <Image
                        src="/logos/playdate_logo.webp"
                        alt='Playdate logo'
                        width={150}
                        height={32}
                        className=''>
                    </Image>
                </Link>
                <Image className='cursor-pointer' src='/icons/hamburger_icon.webp' height={32} width={32} alt='menu icon' onClick={() => setShowMobileMenu(previousValue => !previousValue)}></Image>
                <div id='mobileMenuContainer' className={`w-1/3 min-h-26 min-w-26 absolute z-10 border-t-2 border-l-2 border-b-2 border-appBlue rounded-l p-4 bg-appGold transition-all duration-500 top-12 ${showMobileMenu ? 'right-0' : 'right-[-300px]'}`}>
                    <ul className='flex flex-col'>
                        <li>Dashboard</li>
                        {user ?
                            <li className='cursor-pointer' onClick={handleGoogleLogout}>Logout</li>
                            :
                            <li className='cursor-pointer' onClick={handleGoogleLogin}>Login</li>
                        }
                    </ul>
                </div>
                <div id='weatherContainer' className='min-h-12 w-full'>

                    <Weather />
                </div>
            </header>
        </>
    )
}
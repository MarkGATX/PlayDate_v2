'use client'
import Image from "next/image";
import Weather from "../Weather/Weather";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)

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
                <Image src='/icons/hamburger_icon.webp' height={32} width={32} alt='menu icon' onClick={()=> setShowMobileMenu(previousValue => !previousValue)}></Image>
                <div id='mobileMenuContainer' onClick={()=> setShowMobileMenu(previousValue => !previousValue)} className={`w-1/3 min-h-26 min-w-26 absolute z-10 border-t-2 border-l-2 border-b-2 border-appBlue rounded-l p-4 bg-appGold transition-all duration-500 top-12 ${showMobileMenu ? 'right-0' : 'right-[-300px]'}`}>
                    <ul className='flex flex-col'>
                        <li>Dashboard</li>
                        <li>Login</li>
                    </ul>
                </div>
                <div id='weatherContainer' className='min-h-12 w-full'>

                    <Weather />
                </div>
            </header>
        </>
    )
}
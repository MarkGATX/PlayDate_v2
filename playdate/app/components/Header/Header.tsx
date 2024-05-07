import Image from "next/image";
import Weather from "../Weather/Weather";
import Link from "next/link";

export default function Header() {

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
                <Image src='/icons/hamburger_icon.webp' height={32} width={32} alt='menu icon'></Image>
                <div id='weatherContainer' className='min-h-12 w-full'>
                    <Weather />
                </div>
            </header>
        </>
    )
}
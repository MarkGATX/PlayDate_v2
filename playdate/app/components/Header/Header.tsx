import Image from "next/image";
import Weather from "../Weather/Weather";

export default function Header() {

    return (
        <>
            <header className="w-full pt-2 pr-2 pl-2 flex flex-wrap justify-between gap-3">
                <Image
                    src="/logos/playdate_logo.webp"
                    alt='Playdate logo'
                    width={150}
                    height={32}
                    className=''>
                </Image>
                <Image src='/icons/hamburger_icon.webp' height={32} width={32} alt='menu icon'></Image>
                <Weather />
            </header>
        </>
    )
}
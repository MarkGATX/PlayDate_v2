import Image from "next/image";
import Weather from "../Weather/Weather";

export default function Header() {

    return (
        <>
            <header className="w-full h-8 pt-2 pr-2 pl-2">
                <Image
                    src="/logos/playdate_logo.webp"
                    alt='Playdate logo'
                    width='100'
                    height='20'
                    className=''>
                </Image>
            </header>
                <Weather />
        </>
    )
}
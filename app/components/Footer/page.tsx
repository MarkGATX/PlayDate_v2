import Link from "next/link";

export default function Footer () {
    return (
        <footer className='flex flex-wrap gap-8 justify-center bg-appBlue text-appBG py-8'>
            <Link href='./contact' className='hover:scale-110 transition-all '>Contact Us</Link>
            <Link href='./FAQ' className='hover:scale-110 transition-all '>FAQ</Link>
            <Link href='./TOS' className='hover:scale-110 transition-all '>Terms of Service</Link>
            <Link href='./privacy' className='hover:scale-110 transition-all '>Privacy Policy</Link>

        </footer>
    )
}
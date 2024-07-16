import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="flex flex-col items-center justify-start overflow-y-hidden">
            <h2 className='font-bold text-lg p-4 bg-appBlue w-full text-appBG text-center'>Page not found</h2>
            <div className='p-4'>
            <p className='mb-4'>{`We're sorry but we couldn't find that page. Try searching again on the home page.`}</p>
            <Link href="/">
                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Back to Home</button>
            </Link>
            </div>
        </main>
    )
}
'use client'
import { AddPlaydate } from "@/utils/actions/playdateActions";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { placesDataType } from "@/utils/types/placeTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

type PlaceCardsProps = {
    place: placesDataType;
};

type KidsNameType = {
    first_name: string;
    last_name: string;
    id: string
}

// const PlaceCards: React.FC<PlaceCardsProps> = ({ place, kids, currentUserID }: {place:placesDataType, kids?:KidsNameType, currentUserID:string}) => {
export default function PlaceCards({ place, kids, currentUserID }: { place: placesDataType, kids?: KidsNameType[], currentUserID?: string }) {
    const router = useRouter();
    const [showMore, setShowMore] = useState<boolean>(false)
    const [openSelectKid, setOpenSelectKid] = useState<boolean>(false)
    const [selectedKid, setSelectedKid] = useState<string>('')
    const addressElement = document.getElementById(`${place.id}Address`);
    const summaryElement = document.getElementById(`${place.id}Summary`);
    const linkElement = document.getElementById(`${place.id}Link`);
    const addressElementRef = useRef<HTMLDivElement>()
    const summaryElementRef = useRef<HTMLDivElement>()
    const linkElementRef = useRef<HTMLDivElement>()

    //set number of stars for ratings
    let halfStars: number = 0;
    let fullStars: number = Math.floor(place.rating)
    let decimal: number = place.rating - fullStars
    if (decimal >= .6) {
        halfStars = 0
        fullStars = fullStars + 1
    } else if (decimal === 0) {
        halfStars = 0
    } else {
        halfStars = 1
    }
    let emptyStars: number = 5 - (fullStars + halfStars)

    const handleStartPlaydate = async () => {
        if (!kids) {
            return
        }
        if (!currentUserID) {
            return
        }
        try {
            const newPlaydateData = {
                location: place.id,
                host_id: currentUserID,
                //kid is either selected or the default if there's only one kid in the array
                kid_id: selectedKid || kids[0].id
            }
            console.log(newPlaydateData)
            const newPlaydate = await AddPlaydate(newPlaydateData)
            if(newPlaydate) {
                router.push(`/playdates/${newPlaydate.id}`)
            } 
        } catch (error) {
            console.error(error)
        }
    }

    const handlePickKidForPlaydate = async () => {
        setOpenSelectKid(true)
        setShowMore(previousValue => !previousValue)

    }

    //replace with useGSAP toi smooth out animations and opacity change. switch to refs but figure out if needs to be unique

    useEffect(() => {
        const placeCardDetails = document.getElementById(`${place.id}Details`) as HTMLDivElement;
        const summaryHeight = summaryElement?.offsetHeight || 0;
        const addressHeight = addressElement?.offsetHeight || 0;
        const linkHeight = linkElement?.offsetHeight || 0;
        if (showMore) {
            placeCardDetails.style.height = `${summaryHeight + addressHeight + linkHeight + 100}px`;
        } else {
            placeCardDetails.style.height = '0px';
        }
    }, [showMore, addressElement?.offsetHeight, place.id, summaryElement?.offsetHeight, linkElement?.offsetHeight, openSelectKid]);


    return (
        <div id={place.id} className='min-h-28 w-9/12 mb-12 rounded-xl border-2 border-appBlue overflow-hidden flex flex-col justify-between gap-2'>
            <section id='placeCardDetails' className='w-full p-2 min-h-14 '>

                <h2 className='text-left w-full'>{place.displayName.text}</h2>
                {place.currentOpeningHours?.openNow || place.currentOpeningHours === undefined ?
                    null
                    :
                    <div className='text-red-500 text-xs mb-1'>Currently closed</div>
                }
                <div id='starRatings' className='text-xs flex '>
                    {Array.from({ length: fullStars }).map((_, index) => (
                        <Image src='/icons/star.webp' className='mr-1' width={20} height={20} alt='Full star' key={index}></Image>
                    )
                    )}
                    {Array.from({ length: halfStars }).map((_, index) => (
                        <Image src='/icons/half-star.webp' className='mr-1' width={20} height={20} alt='Half star' key={index}></Image>
                    )
                    )}
                    {Array.from({ length: emptyStars }).map((_, index) => (
                        <Image src='/icons/empty-star.webp' className='mr-1' width={20} height={20} alt='Empty star' key={index}></Image>
                    )
                    )}
                    {place.rating ? `${place.rating} on Google` : 'No ratings'}
                </div>
            </section>
            <section id='placeCardMoreInfo' className='w-full flex flex-col justify-between items-between min-h-12 h-fit border-t-2 border-appBlue bg-appGold '>
                <div id='moreToggleContainer' className='w-full flex justify-center items-center py-4 cursor-pointer hover:scale-150 transform ease-in-out duration-300' onClick={() => setShowMore(previousState => !previousState)}>
                    <Image src={`/icons/down_arrow.webp`} width={15} height={16} alt='down icon to show more details' title='more details' className={`transform ease-in-out duration-700  ${showMore ? '-rotate-180' : 'rotate-0'} `}></Image>
                </div>
                <section id={`${place.id}Details`} style={{ height: 0 }} className={`w-100 mt-2 p-1 overflow-y-hidden transition-all ease-in-out duration-700 ${showMore ? `opacity-100 ` : 'opacity'}`}>
                    {place.formattedAddress ?
                        <p id={`${place.id}Address`} className='text-sm px-2 mb-4'>{place.formattedAddress}</p>
                        :
                        null
                    }
                    {place.editorialSummary ?
                        <>
                            <p id={`${place.id}Summary`} className='text-sm px-2 pb-4 mb-4'>{place.editorialSummary.text}</p>

                        </>
                        :
                        null
                    }
                    <div id={`${place.id}Link`} className='flex flex-col items-center justify-center gap-4'>
                        <Link href={`/place/${place.id}`} className='flex justify-center'>
                            <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >More information...</button>
                        </Link>
                        {
                            //make sure to call created generic function at the end of the switch statement
                            (() => {
                                switch (true) {
                                    case (currentUserID && kids && kids?.length === 1):
                                        return <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleStartPlaydate}>Start a Playdate here...</button>;
                                    case (currentUserID && kids && kids?.length > 1):
                                        return <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => setOpenSelectKid(previousValue => !previousValue)}>{openSelectKid === true ? "Cancel playdate" : "Start a Playdate here..."}</button>;
                                    default:
                                        return <p className='text-xs'>You must be logged in and have kids associated with your account in order to start a Playdate</p>
                                }
                            })()
                        }
                        {openSelectKid && kids && kids.length > 1
                            ?
                            <section>
                                <p>Who is this playdate for?</p>
                                <select value={selectedKid} onChange={async (e) => {setSelectedKid(e.target.value);
                                    await handleStartPlaydate();
                                }} className='mb-4' >
                                    <option value = '' disabled>Select which kid..</option>
                                    {kids.map((kid, index) => (
                                        <option key={index} value={kid.id}>
                                            {kid.first_name} {kid.last_name}
                                        </option>
                                    ))}
                                </select>
                            </section>
                            :
                            null
                        }
                    </div>

                </section>

            </section>

        </div>
    )
}

// export default PlaceCards;
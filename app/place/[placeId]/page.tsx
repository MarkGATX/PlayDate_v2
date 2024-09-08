'use client'

import { placesDataType } from "@/utils/types/placeTypeDefinitions"
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI"
import Image from "next/image"
import { useContext, useEffect, useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import '@/utils/SwiperCustom/swiperCustom.scss'
import { Pagination, EffectFade, Navigation } from 'swiper/modules';
import Link from "next/link"
import { AuthContext } from "@/utils/firebase/AuthContext"
import supabaseClient from "@/utils/supabase/client"
import { AdultsType } from "@/utils/types/userTypeDefinitions"
import { AddPlaydate } from "@/utils/actions/playdateActions"
import { Router } from "next/router"
import { useRouter } from "next/navigation"
import PDPlaceReviews from "@/app/components/PDPlaceReviews/PDPlaceReviews"

export default function PlaceDetails({ params }: { params: { placeId: string } }) {
    const [openSelectKid, setOpenSelectKid] = useState<boolean>(false)
    const [selectedKid, setSelectedKid] = useState<string>('')
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    let [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(undefined)
    const selectedKidForPlaydateRef = useRef<HTMLSelectElement>(null)
    const { user } = useContext(AuthContext)
    const router = useRouter();
    let halfStars: number = 0
    let fullStars: number = 0
    let decimal: number = 0
    let emptyStars: number = 0

    if (currentPlace) {
        halfStars = 0;
        fullStars = Math.floor(currentPlace.rating) || 0
        decimal = currentPlace.rating - fullStars
        if (decimal >= .6) {
            halfStars = 0
            fullStars = fullStars + 1
        } else if (decimal === 0) {
            halfStars = 0
        } else {
            halfStars = 1
        }
        emptyStars = 5 - (fullStars + halfStars)
    }

    useEffect(() => {
        //check local storage to see if place already exists. if so, set state with that place. otherwise fetch the place details first and then set the place
        const places: placesDataType[] = JSON.parse(localStorage.getItem('placesData') || '[]')
        const fetchedPlaceDetails = async () => {
            try {
                const placeDetails = await fetchPlaceDetails(params.placeId)
                if (placeDetails) {
                    const formattedPlaceDetails = JSON.stringify(placeDetails)
                    setCurrentPlace(placeDetails)
                } else {
                    setCurrentPlace(undefined)
                }
            } catch (error) {
                console.error(error)
            }
        }
        if (places.length > 0) {

            setCurrentPlace(places.find(place => place.id === params.placeId))
        } else {
            fetchedPlaceDetails();
        }

    }, [params.placeId])

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const firebase_uid = user?.uid
                if (!firebase_uid) {
                    return
                }
                const { data: adultData, error: adultError } = await supabaseClient
                    .from('Adults')
                    .select('*')
                    .eq('firebase_uid', firebase_uid);
                if (adultError) {
                    throw adultError;
                }
                if (adultData) {
                    setCurrentUser(adultData[0])
                    // COMBINE INTO ONE QUERY
                    const { data: kidsJoinData, error: kidsJoinDataError } = await supabaseClient
                        .from('Adult_Kid')
                        .select('kid_id')
                        .eq('adult_id', adultData[0].id)
                    if (kidsJoinDataError) {
                        throw kidsJoinDataError;
                    }
                    if (kidsJoinData) {
                        //map kidsJoinData into array to use .in method
                        const kidIds = kidsJoinData.map(kidJoin => kidJoin.kid_id);
                        const { data: kidsData, error: kidsDataError } = await supabaseClient
                            .from('Kids')
                            .select('first_name, last_name, id')
                            .in('id', kidIds);
                        if (kidsDataError) {
                            throw kidsDataError;
                        }
                        if (kidsData) {
                            setCurrentUser({
                                ...adultData[0],
                                Kids: kidsData,
                            })
                        }
                    }

                    // }

                }
            } catch (error) {
                console.error(error)
            }
        }
        getCurrentUser();
    }, [user])

    const handleStartPlaydate = async () => {
        if (!currentUser?.Kids) {
            return
        }
        if (!currentUser) {
            return
        }
        try {
            const newPlaydateData = {
                location: params.placeId,
                host_id: currentUser.id,
                //kid is either selected or the default if there's only one kid in the array
                host_kid_id: selectedKidForPlaydateRef?.current?.value || currentUser.Kids[0].id
            }
            const newPlaydate = await AddPlaydate(newPlaydateData)
            if (newPlaydate) {
                router.push(`/playdates/${newPlaydate.id}`)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handlePickKidForPlaydate = async () => {
        setOpenSelectKid(true)

    }
    console.log(currentPlace)
    return (
        <>
            <main>
                <div id='placePicContainer' className='flex h-[250px] w-full'>
                    <Swiper pagination={true} effect={'fade'} navigation={true} modules={[Pagination, Navigation, EffectFade]} >
                        {currentPlace
                            ?
                            !currentPlace.photos || currentPlace.photos.length === 0
                                ?
                                // use override class to force swiper to not define inline style of 150px width
                                <SwiperSlide className='swiper-slide-override'>

                                    <Image
                                        src="/logos/playdate_logo.webp"
                                        alt='Playdate logo'
                                        // width={250}
                                        // height={250}
                                        fill={true}
                                        sizes="(max-width:768px) 100vw, 33vw"
                                        style={{ objectFit: 'contain' }}
                                    />

                                </SwiperSlide>
                                :
                                currentPlace.photos?.map((photo, index) => (
                                    <SwiperSlide key={`${currentPlace?.id}photo${index}`}>
                                        <Image src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`} alt={`pic ${index + 1} of ${currentPlace?.displayName.text}`} fill={true} style={{ objectFit: 'cover' }}></Image>
                                        {photo.authorAttributions[0].displayName
                                            ?
                                            <a href={`${photo.authorAttributions[0].uri}`} target="_blank"><p className='z-10 absolute text-appGold text-xs p-2 bg-appBlueTrans'>Image by {photo.authorAttributions[0].displayName}</p></a>
                                            :
                                            null
                                        }
                                    </SwiperSlide>
                                ))
                            :
                            <p > Loading Images...</p>
                        }
                    </Swiper>


                </div>
                <div id='placeDetails' className='p-4'>
                    <h1 className='text-lg font-bold'>{currentPlace?.displayName.text}</h1>
                    {currentPlace?.formattedAddress ?
                        <p>{currentPlace.formattedAddress}</p>
                        :
                        null
                    }
                    {currentPlace?.internationalPhoneNumber ?
                        <p>{currentPlace.internationalPhoneNumber}</p>
                        :
                        null
                    }

                    <div id='starRatings' className='text-xs flex mb-8 mt-4'>
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
                        {currentPlace?.rating ? `${currentPlace.rating} on Google` : 'No ratings'}
                    </div>
                    <div id='placeDescription'>{currentPlace?.editorialSummary?.text}</div>

                    <div id='placeButtons' className='my-8 flex justify-around w-full'>
                        {currentUser && currentPlace
                            ?
                            <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => router.push(`/place/${currentPlace.id}/CreateReview`)}>Write a review</button>
                            :
                            null
                        }
                        {
                            currentUser
                                ?
                                (() => {
                                    switch (true) {
                                        case (currentUser.id && currentUser.Kids && currentUser.Kids?.length === 1):
                                            return <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleStartPlaydate}>Start a Playdate</button>;
                                        case (currentUser.id && currentUser.Kids && currentUser.Kids?.length > 1):
                                            return <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => setOpenSelectKid(previousValue => !previousValue)}>{openSelectKid === true ? "Cancel playdate" : "Start a Playdate"}</button>;
                                        default:
                                            null
                                    }
                                })()
                                :
                                null
                        }
                    </div>
                    {openSelectKid && currentUser?.Kids && currentUser?.Kids.length > 1
                        ?
                        <section id='startPlaydateSection' className='flex flex-col w-full items-center'>
                            <p>Who is this playdate for?</p>
                            <select value='' ref={selectedKidForPlaydateRef} onChange={async (e) => {
                                setSelectedKid(e.target.value);
                                await handleStartPlaydate();
                            }} className='mb-4' >
                                <option value='' disabled>Select which kid..</option>
                                {currentUser.Kids.map((kid, index) => (
                                    <option key={index} value={kid.id}>
                                        {kid.first_name} {kid.last_name}
                                    </option>
                                ))}
                            </select>
                        </section>
                        :
                        null
                    }
                    {/* <Link href={`/place/${currentPlace?.id}/CreateReview`}>
                            <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Write a Review</button>
                        </Link> */}
                </div>
                {currentPlace ?
                    <>

                        <PDPlaceReviews user={currentUser} placeID={currentPlace.id} />

                    </>
                    :
                    null
                }

            </main >
        </>
    )
}
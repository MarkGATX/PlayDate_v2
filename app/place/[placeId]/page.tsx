'use client'

import { placesDataType } from "@/utils/types/placeTypeDefinitions"
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import '@/utils/SwiperCustom/swiperCustom.scss'
import { Pagination, EffectFade, Navigation } from 'swiper/modules';
import Link from "next/link"

export default function PlaceDetails({ params }: { params: { placeId: string } }) {

    let [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(undefined)
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
        const places: placesDataType[] = JSON.parse(localStorage.getItem('placesData') || '[]')
        const fetchedPlaceDetails = async () => {
            try {
                const placeDetails = await fetchPlaceDetails(params.placeId)
                console.log(placeDetails)
                if (placeDetails) {
                    console.log('place details true: ', placeDetails)
                    const formattedPlaceDetails = JSON.stringify(placeDetails)
                    console.log(formattedPlaceDetails)
                    setCurrentPlace(placeDetails)
                } else {
                    console.log('place details undefined')
                    setCurrentPlace(undefined)
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (places.length > 0) {
            console.log('places good')
            setCurrentPlace(places.find(place => place.id === params.placeId))
        } else {
            console.log('fetch details')
            fetchedPlaceDetails();
        }

    }, [params.placeId])

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
                                            <a href={`${photo.authorAttributions[0].uri}`} target="_blank"><p className='z-10 absolute text-appGold text-xs pl-2 pt-2'>Image by {photo.authorAttributions[0].displayName}</p></a>
                                            :
                                            null
                                        }
                                    </SwiperSlide>
                                ))
                            :
                            <p > Loading Images...</p>
                        }
                    </Swiper>
                    {/* <Swiper pagination={true} effect={'fade'} navigation={true} modules={[Pagination, Navigation, EffectFade]}>
                        {currentPlace
                            ?
                            (currentPlace.photos?.length > 0 // Check if photos array has elements
                                ?
                                (currentPlace.photos.map((photo, index) => (
                                    <SwiperSlide key={`${currentPlace?.id}photo${index}`}>
                                        <Image
                                            src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=300&maxHeightPx=300`}
                                            alt={`pic ${index + 1} of ${currentPlace?.displayName.text}`}
                                            fill={true}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {photo.authorAttributions[0].displayName
                                            ?
                                            (
                                                <a href={`${photo.authorAttributions[0].uri}`} target="_blank">
                                                    <p className='z-10 absolute text-appGold text-xs pl-2 pt-2'>Image by {photo.authorAttributions[0].displayName}</p>
                                                </a>
                                            )
                                            :
                                            null
                                        }
                                    </SwiperSlide>
                                )))
                                :
                                (
                                    <Image
                                        src="/logos/playdate_logo.webp"
                                        alt='Playdate logo'
                                        fill={true}
                                        style={{ objectFit: 'cover' }}
                                    />
                               
                                )
                            ) : 
                            null
                            }
                    </Swiper> */}

                </div>
                <div id='placeDetails' className='p-4'>
                    <h1 className='text-lg font-bold'>{currentPlace?.displayName.text}</h1>
                    <div id='starRatings' className='text-xs flex mb-8'>
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
                        <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Start a Playdate</button>
                        <Link href={`/place/${currentPlace?.id}/CreateReview`}>
                            <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Write a Review</button>
                        </Link>
                    </div>
                </div>
            </main >
        </>
    )
}
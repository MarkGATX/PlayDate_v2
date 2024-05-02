'use client'

import { placesDataType } from "@/utils/map/nearbyPlacesAPI"
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


    return (
        <>
            <main>
                <div id='placePicContainer' className='flex h-[300px]'>
                    
                    <Swiper pagination={true} effect={'fade'} navigation={true} modules={[Pagination, Navigation, EffectFade]} >
                        {currentPlace ?
                            currentPlace.photos.map((photo, index) => (

                                <SwiperSlide >
                                    <Image src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=300&maxHeightPx=300`} key={currentPlace?.id} alt={`pic ${index + 1} of ${currentPlace?.displayName.text}`} fill={true} style={{ objectFit: 'cover' }}></Image>
                                    <a href={`${photo.authorAttributions[0].uri}`} target="_blank"><p className='z-10 absolute text-appGold text-xs pl-2 pt-2'>Image by {photo.authorAttributions[0].displayName}</p></a>

                                </SwiperSlide>
                            ))
                            :
                            <p >Loading Images...</p>
                        }
                    </Swiper>

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
                        <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Write a Review</button>
                    </div>
                </div>
            </main>
        </>
    )
}
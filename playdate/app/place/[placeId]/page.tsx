'use client'

import { DataType, placesDataType } from "@/utils/map/nearbyPlacesAPI"
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

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
                    <Swiper pagination={true} modules={[Pagination]} >
                        {currentPlace ?
                            currentPlace.photos.map((photo) => {
                                console.log(photo.name)
                                let imageSrc = `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=300&maxHeightPx=300`
                                return (
                                    // <Image src={imageSrc} key={currentPlace?.id} alt={`pics of ${currentPlace?.displayName}`} width={300} height={300}></Image>
                                    <SwiperSlide>
                                        <Image src={imageSrc} key={currentPlace?.id} alt={`pics of ${currentPlace?.displayName}`} width={300} height={300}></Image>
                                    </SwiperSlide>
                                )
                            })

                            :
                            <p >Loading Images...</p>
                        }
                    </Swiper>
                </div>
                <div id='placeDetails' className='p-4'>
                    <h1 className='text-lg font-bold'>{currentPlace?.displayName.text}</h1>
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
                        {currentPlace?.rating ? `${currentPlace.rating} on Google` : 'No ratings'}
                    </div>
                </div>
            </main>
        </>
    )
}
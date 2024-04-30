'use client'

import { placesDataType } from "@/utils/map/googlePlacesAPI"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function PlaceDetails({ params }: { params: { placeId: string } }) {
    console.log(params)
    const [imageUrls, setImageUrls] = useState<string[] | undefined>()
    const places: placesDataType[] = JSON.parse(localStorage.getItem('placesData') || '[]')
    const currentPlace = places.find(place => place.id === params.placeId)

    useEffect(() => {

        const googlePlacesId = params.placeId


        if (currentPlace) {
            // imageURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;
            // setImageUrls(`https://places.googleapis.com/v1/${currentPlace.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=400`)
            // console.log(imageUrls)
            // console.log(imageUrl)
            // return (
            //     <img src={`${imageUrl}`}></img>
            // )
        }

    }, [params.placeId])


    return (
        <>
            <div>test 2</div>
            {currentPlace ?
                currentPlace.photos.map((photo) => {
                    console.log(photo.name)
                    let imageSrc = `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=400&maxHeightPx=400`
                    return (
                        <Image src={imageSrc} alt={`pics of ${currentPlace.displayName}`} width={400} height={400}></Image>
                    )
                })

                :
                null
            }

            {/* {imageURL ?
                <img src={`${imageURL}`}></img>
                :
                <div>{imageURL}</div>
            } */}
        </>
    )
}
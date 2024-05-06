'use client'
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI"
import { placesDataType } from "@/utils/types/typeDefinitions"
import { useEffect, useState } from "react"
import { amenityList } from "@/utils/map/amenityList"

export default function CreateReview({ params }: { params: { placeId: string } }) {
    const [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(undefined)

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
        <main className='px-4'>
            {currentPlace
                ?
                <h2 className='text-lg font-bold'>{currentPlace?.displayName.text} Review</h2>
                :
                <h2 className='text-lg font-bold'>{`That place isn't found. Check your link and try again.`}</h2>
            }
            <form className='flex'>
                <fieldset className='flex flex-wrap mt-4'>
                {amenityList.map((amenity, index) => (
                    <div key={index} className='w-1/2 flex justify-start'>
                        <input type='checkbox' id={`amenity=${index}`} ></input><label htmlFor={`amenity=${index}`} className='pl-2'>{amenity}</label>
                    </div>
                ))}
                </fieldset>

            </form>
        </main>
    )
}
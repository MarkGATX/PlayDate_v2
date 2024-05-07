'use client'
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI"
import { placesDataType, placesDataTypeWithExpiry } from "@/utils/types/typeDefinitions"
import { useEffect, useState } from "react"
import { amenityList } from "@/utils/map/amenityList"

export default function CreateReview({ params }: { params: { placeId: string } }) {
    const [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(undefined)
    const [reviewLength, setReviewLength] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchedPlaceDetails = async () => {
            try {
                const placeDetails = await fetchPlaceDetails(params.placeId)
                console.log(placeDetails)
                if (placeDetails) {
                    console.log('place details true: ', placeDetails)
                    setCurrentPlace(placeDetails)
                    setLoading(false)
                } else {
                    console.log('place details undefined')
                    setCurrentPlace(undefined)
                    setLoading(false)
                }
            } catch (error) {
                console.log(error)
            }
        }

        const checkForLocalStorage = async () => {
            const storedPlaces: placesDataTypeWithExpiry = await JSON.parse(localStorage.getItem('placesData') || '[]')
            console.log('places from storage: ', storedPlaces)

            if (storedPlaces && storedPlaces.places.length > 0) {
                console.log('places good')
                setCurrentPlace(storedPlaces.places.find(place => place.id === params.placeId))
            } else {
                console.log('fetch details')
                fetchedPlaceDetails();
            }
        }

        checkForLocalStorage();

    }, [params.placeId])

    const updateReviewLength = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        let currentLength = (event.target as HTMLTextAreaElement).value.length
        setReviewLength(currentLength)
    }

    return (
        <main className='px-4'>
            {loading ?
                <h2 className='text-lg font-bold'>Loading...</h2>
                :
                currentPlace
                    ?
                    <h2 className='text-lg font-bold'>{currentPlace?.displayName.text} Review</h2>
                    :
                    <h2 className='text-lg font-bold'>{`That place isn't found. Check your link and try again.`}</h2>
            }
            <form className='flex flex-wrap'>
                <fieldset className='flex flex-wrap mt-4 w-full'>
                    {amenityList.map((amenity, index) => (
                        <div key={index} className='w-1/2 flex justify-start'>
                            <input type='checkbox' id={`amenity=${index}`} ></input><label htmlFor={`amenity=${index}`} className='pl-2'>{amenity}</label>
                        </div>
                    ))}
                </fieldset>
                <div id='writtenReviewContainer' className="w-full mt-4">
                    <label htmlFor='writtenReview'>Review (500/{`${reviewLength}`})</label>
                    <textarea id='writtenReview' className={`w-full border-2 rounded min-h-36 border-appBlue bg-inputBG p-2 ${reviewLength >= 300 ? 'text-red-500' : ''}`} maxLength={300} onKeyDown={updateReviewLength} placeholder="Write your review (300 characters or less)"></textarea>
                </div>
                <div id='reviewSaveButtonContainer' className='flex w-full justify-center mt-4'>
                    <button className='px-4 w-[130px] text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 active:bg-appGold active:shadow-activeButton active:text-appBlue disabled:opacity-50  disabled:pointer-events-none'>Save</button>
                </div>
            </form>
        </main>
    )
}
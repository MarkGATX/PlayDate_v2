'use client'

import { amenityList } from "@/utils/map/amenityList";
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI";
import supabaseClient from "@/utils/supabase/client";
import { placeReviewType, placesDataType } from "@/utils/types/placeTypeDefinitions";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import 'quill/dist/quill.snow.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import '@/utils/SwiperCustom/swiperCustom.scss'
import Quill from "quill";

// export default function PlaceReview({ params }: { params: { reviewId: string } }) {
export default function PlaceReview({ params }: { params: { reviewId: string } }) {
    const { reviewId } = params
    const [currentReview, setCurrentReview] = useState<placeReviewType | null>();
    const [currentPlace, setCurrentPlace] = useState<placesDataType>()
    const [quill, setQuill] = useState<Quill | null>(null);
    const [openReviewEditor, setOpenReviewEditor] = useState<boolean>(false)
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && toolbarRef.current && !quill) {
            const quillInstance = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: toolbarRef.current
                }
            });
            setQuill(quillInstance);
        }
    }, [quill, currentReview]);

    // Separate useEffect for setting contents
    useEffect(() => {
        if (quill && currentReview?.reviewer_notes) {
            quill.setContents(currentReview.reviewer_notes);
        }
    }, [quill, currentReview]);

    useEffect(() => {
        if (quill) {
            quill.enable(openReviewEditor);
            if (toolbarRef.current) {
                toolbarRef.current.style.display = openReviewEditor ? 'block' : 'none';
            }
        }
    }, [openReviewEditor, quill]);

    useEffect(() => {
        const getPlaceReview = async () => {
            try {
                const { data: reviewData, error: reviewDataError } = await supabaseClient
                    .from('Location_Reviews')
                    .select('*')
                    .eq('id', reviewId);
                if (reviewDataError) {
                    throw reviewDataError;
                }
                setCurrentReview(reviewData[0])
                if (reviewData[0].google_place_id) {
                    //check local storage to see if place already exists. if so, set state with that place. otherwise fetch the place details first and then set the place
                    const places: placesDataType[] = JSON.parse(localStorage.getItem('placesData') || '[]')
                    const fetchedPlaceDetails = async () => {
                        try {
                            const placeDetails = await fetchPlaceDetails(reviewData[0].google_place_id)
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

                        setCurrentPlace(places.find(place => place.id === reviewData[0].google_place_id))
                    } else {
                        fetchedPlaceDetails();
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        getPlaceReview();
    }, [params.reviewId])

    console.log(currentReview)
    return (
        <main >
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
            {currentPlace
                ?
                <h2 className='text-lg font-bold p-4 bg-appBlue text-appBG'>{currentPlace?.displayName.text} Review</h2>
                :
                <h2 className='text-lg font-bold'>{`That place isn't found. Check your link and try again.`}</h2>
            }

            <section className='flex flex-wrap px-4 justify-center mt-4'>
                <div className='flex justify-start'>
                    {currentReview
                        ?
                        <>
                            <Image src={currentReview.stars >= 1 ? `/icons/star.webp` : `/icons/empty-star.webp`} className='mr-1' width={36} height={36} alt='Empty star' ></Image>
                            <Image src={currentReview.stars >= 2 ? `/icons/star.webp` : `/icons/empty-star.webp`} className='mr-1' width={36} height={36} alt='Empty star' ></Image>
                            <Image src={currentReview.stars >= 3 ? `/icons/star.webp` : `/icons/empty-star.webp`} className='mr-1' width={36} height={36} alt='Empty star' ></Image>
                            <Image src={currentReview.stars >= 4 ? `/icons/star.webp` : `/icons/empty-star.webp`} className='mr-1' width={36} height={36} alt='Empty star' ></Image>
                            <Image src={currentReview.stars >= 5 ? `/icons/star.webp` : `/icons/empty-star.webp`} className='mr-1' width={36} height={36} alt='Empty star' ></Image>
                        </>
                        :
                        null
                    }
                </div>
                <fieldset className='flex flex-wrap mt-4 w-full'>
                    {currentReview ? (
                        (() => {
                            //use rest to isolate the available amenities.
                            const { stars, reviewer_notes, reviewer_id, google_place_id, id, ...amenities } = currentReview;
                            // iterate over the new amenities object and 
                            return Object.entries(amenities).map(([key, value], index) => {
                                const amenity = key.replace(/_/g, ' ');
                                return (
                                    <div key={index} className='w-1/2 flex justify-start'>
                                        <input
                                            type='checkbox'
                                            id={key}
                                            checked={value}
                                            readOnly
                                            //false inputs still allowed checks so added onclick to prevent
                                           onClick={(event)=> event.preventDefault()} 
                                            aria-readonly="true"
                                        />
                                        <label htmlFor={key} className='pl-2 text-sm'>{amenity}</label>
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        amenityList.map((amenity, index) => {
                            const transformedAmenity = amenity.toLowerCase().replace(/\s+/g, '_');
                            return (
                                <div key={index} className='w-1/2 flex justify-start'>
                                    <input type='checkbox' id={transformedAmenity} />
                                    <label htmlFor={transformedAmenity} className='pl-2 text-sm'>{amenity}</label>
                                </div>
                            );
                        })
                    )}
                </fieldset>
                {currentReview && currentReview.reviewer_notes
                    ?
                    <div className={`quillEditorContainer w-full min-h-48 rounded flex flex-col justify-center border-appBlue border-2 mt-4`}>
                        <div ref={toolbarRef}>
                            <span className="ql-formats">
                                <button className="ql-bold"></button>
                                <button className="ql-italic"></button>
                                <button className="ql-underline"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-list" value="ordered"></button>
                                <button className="ql-list" value="bullet"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-clean"></button>
                            </span>
                        </div>
                        <div ref={editorRef} ></div>
                    </div>
                    :
                    null
                }


                {/* <div id='reviewSaveButtonContainer' className='flex w-full justify-center mt-4'>
                    <button className='px-4 min-w-48 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 active:bg-appGold active:shadow-activeButton active:text-appBlue disabled:opacity-50  disabled:pointer-events-none' onPointerDown={(event) => handleSaveReview(event)}>Save Your Review</button>
                </div> */}
            </section>
        </main>
    )
}
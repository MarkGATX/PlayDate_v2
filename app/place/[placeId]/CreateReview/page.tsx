"use client";
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI";
import {
  placeReviewType,
  placesDataType,
  placesDataTypeWithExpiry,
} from "@/utils/types/placeTypeDefinitions";
import { useContext, useEffect, useRef, useState } from "react";
import { amenityList, AmenityType } from "@/utils/map/amenityList";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { AuthContext } from "@/utils/firebase/AuthContext";
import supabaseClient from "@/utils/supabase/client";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "quill/dist/quill.snow.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "@/utils/SwiperCustom/swiperCustom.scss";
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import Quill from "quill";
import { Delta } from "quill/core";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateReview({
  params,
}: {
  params: { placeId: string };
}) {
  const [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(
    undefined,
  );
  // const [reviewLength, setReviewLength] = useState<number>(0)
  const [currentUser, setCurrentUser] = useState<AdultsType>();
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [quill, setQuill] = useState<Quill | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  //Record is typescript referencing an array of key value pairs that have a boolean for the value
  const [amenityValues, setAmenityValues] = useState<Record<string, boolean>>(
    {},
  );

  // const defaultText: Delta = new Delta().insert('Write a note', { bold: true });
  const router = useRouter();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quill) {
      const quillInstance = new Quill(editorRef.current, {
        theme: "snow",

        modules: {
          toolbar: toolbarRef.current,
        },
      });
      setQuill(quillInstance);
    }
  }, [quill]);

  useEffect(() => {
    //check local storage to see if place already exists. if so, set state with that place. otherwise fetch the place details first and then set the place
    const places: placesDataType[] = JSON.parse(
      localStorage.getItem("placesData") || "[]",
    );
    const fetchedPlaceDetails = async () => {
      try {
        const placeDetails = await fetchPlaceDetails(params.placeId);
        if (placeDetails) {
          const formattedPlaceDetails = JSON.stringify(placeDetails);
          setCurrentPlace(placeDetails);
        } else {
          setCurrentPlace(undefined);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (places.length > 0) {
      setCurrentPlace(places.find((place) => place.id === params.placeId));
    } else {
      fetchedPlaceDetails();
    }
  }, [params.placeId]);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const firebase_uid = user?.uid;
        if (!firebase_uid) {
          return;
        }
        const { data: adultData, error: adultError } = await supabaseClient
          .from("Adults")
          .select("*")
          .eq("firebase_uid", firebase_uid);
        if (adultError) {
          throw adultError;
        }
        if (adultData) {
          setCurrentUser(adultData[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getCurrentUser();
  }, [user]);

  // const updateReviewLength = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //     let currentLength = (event.target as HTMLTextAreaElement).value.length
  //     setReviewLength(currentLength)
  // }

  //state variable to hold all the amenity values in state. easier than retrieving on form submission
  const handleCheckboxChange = (amenity: string, checked: boolean) => {
    setAmenityValues((prev) => ({
      ...prev,
      [amenity.toLowerCase().replace(/\s+/g, "_")]: checked,
    }));
  };

  const handleSaveReview = async (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    try {
      if (!quill) return;

      // Get Quill editor contents
      const reviewDeltaContent = quill.getContents();
      const reviewPlainTextContent = quill.getText();
      if (!currentPlace || !currentUser) {
        return;
      } else {
        const locationReviewData = {
          reviewer_notes: reviewDeltaContent,
          reviewer_notes_plain_text: reviewPlainTextContent,
          google_place_id: currentPlace?.id,
          reviewer_id: currentUser?.id,
          stars: starRating,
          ...amenityValues, // Spread the amenity data into individual key value pairs
        };

        const { data: locationReview, error: locationReviewError } =
          await supabaseClient
            .from("Location_Reviews")
            .insert(locationReviewData)
            .select();
        if (locationReviewError) {
          throw locationReviewError;
        }

        router.push(
          `/place/${currentPlace?.id}/PlaceReview/${locationReview[0].id}`,
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className='xl:flex'>
      <div className='xl:flex xl:flex-col w-full xl:w-2/3 xl:order-2'>
        <div id="placePicContainer" className="flex h-[250px] sm:h-[33dvh] xl:h-[70dvh] w-full ">
          <Swiper
            pagination={true}
            effect={"fade"}
            navigation={true}
            modules={[Pagination, Navigation, EffectFade]}
          >
            {currentPlace ? (
              !currentPlace.photos || currentPlace.photos.length === 0 ? (
                // use override class to force swiper to not define inline style of 150px width
                <SwiperSlide className="swiper-slide-override">
                  <Image
                    src="/logos/playdate_logo.webp"
                    alt="Playdate logo"
                    // width={250}
                    // height={250}
                    fill={true}
                    sizes="(max-width:768px) 100vw, 33vw"
                    style={{ objectFit: "contain" }}
                  />
                </SwiperSlide>
              ) : (
                currentPlace.photos?.map((photo, index) => (
                  <SwiperSlide key={`${currentPlace?.id}photo${index}`}>
                    <Image
                      src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`}
                      alt={`pic ${index + 1} of ${currentPlace?.displayName.text}`}
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                    {photo.authorAttributions[0].displayName ? (
                      <a
                        href={`${photo.authorAttributions[0].uri}`}
                        target="_blank"
                      >
                        <p className="absolute z-10 bg-blueGradient bg-appBlueTrans p-2 text-xs text-appGold">
                          Image by {photo.authorAttributions[0].displayName}
                        </p>
                      </a>
                    ) : null}
                  </SwiperSlide>
                ))
              )
            ) : (
              <p> Loading Images...</p>
            )}
          </Swiper>
        </div>
        {currentPlace ? (
          <h2 className="bg-blueGradient bg-appBlue p-4 text-lg font-bold text-appBG w-full">
            <Link href={`/place/${currentPlace.id}`}>
              {currentPlace?.displayName.text}
            </Link>{" "}
            Review
          </h2>
        ) : (
          <h2 className="text-lg font-bold">{`That place isn't found. Check your link and try again.`}</h2>
        )}
      </div>

      <section className="mt-4 flex flex-wrap xl:flex-col xl:align-top xl:justify-start justify-center px-4 xl:order-1">
        <div className="flex justify-center flex-none xl:h-[36px] ">
          <Image
            src={
              starRating >= 1 ? `/icons/star.webp` : `/icons/empty-star.webp`
            }
            className="mr-1 flex-none"
            width={36}
            height={36}
            alt="Empty star"
            onPointerDown={() => setStarRating(1)}
          ></Image>
          <Image
            src={
              starRating >= 2 ? `/icons/star.webp` : `/icons/empty-star.webp`
            }
            className="mr-1"
            width={36}
            height={36}
            alt="Empty star"
            onPointerDown={() => setStarRating(2)}
          ></Image>
          <Image
            src={
              starRating >= 3 ? `/icons/star.webp` : `/icons/empty-star.webp`
            }
            className="mr-1"
            width={36}
            height={36}
            alt="Empty star"
            onPointerDown={() => setStarRating(3)}
          ></Image>
          <Image
            src={
              starRating >= 4 ? `/icons/star.webp` : `/icons/empty-star.webp`
            }
            className="mr-1"
            width={36}
            height={36}
            alt="Empty star"
            onPointerDown={() => setStarRating(4)}
          ></Image>
          <Image
            src={
              starRating >= 5 ? `/icons/star.webp` : `/icons/empty-star.webp`
            }
            className="mr-1"
            width={36}
            height={36}
            alt="Empty star"
            onPointerDown={() => setStarRating(5)}
          ></Image>
        </div>
        <fieldset className="mt-4 flex w-full flex-wrap">
          {amenityList.map((amenity, index) => (
            <div key={index} className="flex w-1/2 justify-start">
              <input
                type="checkbox"
                id={amenity.toLowerCase().replace(/\s+/g, "_")}
                checked={
                  amenityValues[amenity.toLowerCase().replace(/\s+/g, "_")] ||
                  false
                }
                onChange={(e) =>
                  handleCheckboxChange(
                    amenity.toLowerCase().replace(/\s+/g, "_"),
                    e.target.checked,
                  )
                }
              ></input>
              <label
                htmlFor={amenity.toLowerCase().replace(/\s+/g, "_")}
                className="pl-2 text-sm"
              >
                {amenity}
              </label>
            </div>
          ))}
        </fieldset>
        <div
          className={`quillEditorContainer mt-4 flex min-h-48 w-full flex-col justify-center rounded border-2 border-appBlue`}
        >
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
          <div ref={editorRef}></div>
        </div>

        <div
          id="reviewSaveButtonContainer"
          className="mt-4 flex w-full justify-center"
        >
          <button
            className="min-w-48 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-4 py-2 text-sm duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onPointerDown={(event) => handleSaveReview(event)}
          >
            Save Your Review
          </button>
        </div>
      </section>
    </main>
  );
}

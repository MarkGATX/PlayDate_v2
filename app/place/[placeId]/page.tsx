"use client";

import { AmenityReview, placeReviewType, placesDataType } from "@/utils/types/placeTypeDefinitions";
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI";
import Image from "next/image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "@/utils/SwiperCustom/swiperCustom.scss";
import { Pagination, EffectFade, Navigation } from "swiper/modules";
import Link from "next/link";
import { AuthContext } from "@/utils/firebase/AuthContext";
import supabaseClient from "@/utils/supabase/client";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { AddPlaydate } from "@/utils/actions/playdateActions";
import { Router } from "next/router";
import { useRouter } from "next/navigation";
import PDPlaceReviews from "@/app/components/PDPlaceReviews/PDPlaceReviews";
import { PostgrestError } from "@supabase/supabase-js";
import { amenityIcons } from "@/utils/map/amenityList";

export default function PlaceDetails({
  params,
}: {
  params: { placeId: string };
}) {
  const [openSelectKid, setOpenSelectKid] = useState<boolean>(false);
  const [selectedKid, setSelectedKid] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<AdultsType>();
  let [currentPlace, setCurrentPlace] = useState<placesDataType | undefined>(undefined);
  const [userReviewStars, setUserReviewStars] = useState<number | null>(null);
  const [placeAmenities, setPlaceAmenities] = useState<AmenityReview | null>(null);
  const selectedKidForPlaydateRef = useRef<HTMLSelectElement>(null);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  let halfStars: number = 0;
  let fullStars: number = 0;
  let decimal: number = 0;
  let emptyStars: number = 0;


  const userFullStars = userReviewStars ? Math.floor(userReviewStars) : 0;
  const userHalfStars = userReviewStars
    ? userReviewStars % 1 >= 0.5
      ? 1
      : 0
    : 0;
  const userEmptyStars = userReviewStars
    ? 5 - userFullStars - userHalfStars
    : 5;

  if (currentPlace) {
    halfStars = 0;
    fullStars = Math.floor(currentPlace.rating) || 0;
    decimal = currentPlace.rating - fullStars;
    if (decimal >= 0.6) {
      halfStars = 0;
      fullStars = fullStars + 1;
    } else if (decimal === 0) {
      halfStars = 0;
    } else {
      halfStars = 1;
    }
    emptyStars = 5 - (fullStars + halfStars);


  }

  const getUserReviews = useCallback(async () => {
    console.log('getUserReviews')
    try {
      const {
        data: reviewData,
        error: reviewDataError,
      }: { data: placeReviewType[] | null; error: PostgrestError | null } =
        await supabaseClient
          .from("Location_Reviews")
          .select("*")
          .eq("google_place_id", params.placeId);
      if (reviewDataError) {
        throw new Error("Error getting playdate user ");
      }
      console.log(reviewData)
      //set PD user review stars
      if (reviewData && reviewData.length > 0) {
        const sum = reviewData?.reduce((sum, review) => sum + review.stars, 0);
        const average = Math.round(sum / reviewData.length);
        setUserReviewStars(average);
        console.log(reviewData)
        //set list of user review amenities
        setPlaceAmenities(aggregateAmenities(reviewData));
      }
    } catch (error) {
      console.error(error);
    }
  }, [params.placeId]);

  const aggregateAmenities = (reviews: placeReviewType[]): AmenityReview => {
    return reviews.reduce(
      (acc, review) => {
        (Object.keys(acc) as Array<keyof AmenityReview>).forEach((amenity) => {
          acc[amenity] = acc[amenity] || review[amenity];
        });
        return acc;
      },
      {
        restrooms: false,
        pool: false,
        splash_pad: false,
        wading_pool: false,
        food: false,
        basketball: false,
        tennis: false,
        soccer: false,
        picnic_tables: false,
        toddler_swings: false,
        hiking: false,
        pickle_ball: false,
        softball: false,
        baseball: false,
        playscape: false,
      } as AmenityReview,
    );
  };

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
    getUserReviews()
  }, [params.placeId, getUserReviews]);

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
          // COMBINE INTO ONE QUERY
          const { data: kidsJoinData, error: kidsJoinDataError } =
            await supabaseClient
              .from("Adult_Kid")
              .select("kid_id")
              .eq("adult_id", adultData[0].id);
          if (kidsJoinDataError) {
            throw kidsJoinDataError;
          }
          if (kidsJoinData) {
            //map kidsJoinData into array to use .in method
            const kidIds = kidsJoinData.map((kidJoin) => kidJoin.kid_id);
            const { data: kidsData, error: kidsDataError } =
              await supabaseClient
                .from("Kids")
                .select("first_name, last_name, id")
                .in("id", kidIds);
            if (kidsDataError) {
              throw kidsDataError;
            }
            if (kidsData) {
              setCurrentUser({
                ...adultData[0],
                Kids: kidsData,
              });
            }
          }

          // }
        }
      } catch (error) {
        console.error(error);
      }
    };
    getCurrentUser();
  }, [user]);

  const handleStartPlaydate = async () => {
    if (!currentUser?.Kids) {
      return;
    }
    if (!currentUser) {
      return;
    }
    try {
      const newPlaydateData = {
        location: params.placeId,
        host_id: currentUser.id,
        //kid is either selected or the default if there's only one kid in the array
        host_kid_id:
          selectedKidForPlaydateRef?.current?.value || currentUser.Kids[0].id,
      };
      const newPlaydate = await AddPlaydate(newPlaydateData);
      if (newPlaydate) {
        router.push(`/playdates/${newPlaydate.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePickKidForPlaydate = async () => {
    setOpenSelectKid(true);
  };
  console.log(placeAmenities);

  return (
    <>
      <main className='xl:flex'>
        <div className='xl:flex xl:flex-col w-full xl:w-2/3 xl:order-2'>
          <div id="placePicContainer" className="flex h-[250px] sm:h-[33dvh] xl:h-[90dvh] w-full ">
            <Swiper
              pagination={true}
              effect={"fade"}
              navigation={true}
              modules={[Pagination, Navigation, EffectFade]}
              className='w-full'
            >
              {currentPlace ? (
                !currentPlace.photos || currentPlace.photos.length === 0 ? (
                  // use override class to force swiper to not define inline style of 150px width
                  <SwiperSlide className="swiper-slide-override">
                    <Image
                      src="/logos/playdate_logo.webp"
                      alt="Playdate logo"
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
                        sizes="(max-width:768px) 100vw, 33vw"
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
        </div>
        <div className="xl:flex xl:flex-col xl:w-1/3">
          <div id="placeDetails" className="w-full ">
            <h1 className="text-lg font-bold text-appBG bg-blueGradient bg-appBlue w-full p-4">
              {currentPlace?.displayName.text}
            </h1>
            {currentPlace?.formattedAddress ? (
              <p className='px-4 mt-4'>{currentPlace.formattedAddress}</p>
            ) : null}
            {currentPlace?.internationalPhoneNumber ? (
              <p className='px-4'>{currentPlace.internationalPhoneNumber}</p>
            ) : null}

            <div id="starRatings" className="mb-4 mt-4 flex text-xs px-4">
              {Array.from({ length: fullStars }).map((_, index) => (
                <Image
                  src="/icons/star.webp"
                  className="mr-1"
                  width={20}
                  height={20}
                  alt="Full star"
                  key={index}
                ></Image>
              ))}
              {Array.from({ length: halfStars }).map((_, index) => (
                <Image
                  src="/icons/half-star.webp"
                  className="mr-1"
                  width={20}
                  height={20}
                  alt="Half star"
                  key={index}
                ></Image>
              ))}
              {Array.from({ length: emptyStars }).map((_, index) => (
                <Image
                  src="/icons/empty-star.webp"
                  className="mr-1"
                  width={20}
                  height={20}
                  alt="Empty star"
                  key={index}
                ></Image>
              ))}
              {currentPlace?.rating
                ? `${currentPlace.rating} on Google`
                : "No ratings"}
            </div>
            <div id="placeAmenities" className="mt-2 flex flex-wrap px-2">
              {placeAmenities &&
                (Object.keys(placeAmenities) as Array<keyof AmenityReview>).map(
                  (amenity) =>
                    placeAmenities[amenity] ? (
                      <Image
                        key={`${amenity}${currentPlace?.id}`}
                        src={amenityIcons[amenity]}
                        className="m-2"
                        width={32}
                        height={32}
                        alt={`${amenity} icon`}
                        title={`${amenity}`}
                      />
                    ) : null,
                )}
            </div>
            {/* {userReviewStars ? (
              <div id="userStarRating" className="mt-2 flex items-center text-xs">
                {Array.from({ length: userFullStars }).map((_, index) => (
                  <Image
                    src="/icons/star.webp"
                    className="mr-1"
                    width={20}
                    height={20}
                    alt="Full star"
                    key={index}
                  ></Image>
                ))}
                {Array.from({ length: userHalfStars }).map((_, index) => (
                  <Image
                    src="/icons/half-star.webp"
                    className="mr-1"
                    width={20}
                    height={20}
                    alt="Half star"
                    key={index}
                  ></Image>
                ))}
                {Array.from({ length: userEmptyStars }).map((_, index) => (
                  <Image
                    src="/icons/empty-star.webp"
                    className="mr-1"
                    width={20}
                    height={20}
                    alt="Empty star"
                    key={index}
                  ></Image>
                ))}
                {`${userReviewStars} stars on Playdate`}
              </div>
            ) : null} */}
            <div id="placeDescription" className='px-4'>
              {currentPlace?.editorialSummary?.text}
            </div>

            <div id="placeButtons" className="my-8 flex w-full justify-around">
              {currentUser && currentPlace ? (
                <button
                  className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                  onClick={() =>
                    router.push(`/place/${currentPlace.id}/CreateReview`)
                  }
                >
                  Write a review
                </button>
              ) : null}
              {currentUser
                ? (() => {
                  switch (true) {
                    case currentUser.id &&
                      currentUser.Kids &&
                      currentUser.Kids?.length === 1:
                      return (
                        <button
                          className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                          onClick={handleStartPlaydate}
                        >
                          Start a Playdate
                        </button>
                      );
                    case currentUser.id &&
                      currentUser.Kids &&
                      currentUser.Kids?.length > 1:
                      return (
                        <button
                          className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                          onClick={() =>
                            setOpenSelectKid((previousValue) => !previousValue)
                          }
                        >
                          {openSelectKid === true
                            ? "Cancel playdate"
                            : "Start a Playdate"}
                        </button>
                      );
                    default:
                      null;
                  }
                })()
                : null}
            </div>
            {openSelectKid &&
              currentUser?.Kids &&
              currentUser?.Kids.length > 1 ? (
              <section
                id="startPlaydateSection"
                className="flex w-full flex-col items-center"
              >
                <p>Who is this playdate for?</p>
                <select
                  value=""
                  ref={selectedKidForPlaydateRef}
                  onChange={async (e) => {
                    setSelectedKid(e.target.value);
                    await handleStartPlaydate();
                  }}
                  className="mb-4"
                >
                  <option value="" disabled>
                    Select which kid..
                  </option>
                  {currentUser.Kids.map((kid, index) => (
                    <option key={index} value={kid.id}>
                      {kid.first_name} {kid.last_name}
                    </option>
                  ))}
                </select>
              </section>
            ) : null}
            {/* <Link href={`/place/${currentPlace?.id}/CreateReview`}>
                            <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-blueGradient hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-xl transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Write a Review</button>
                        </Link> */}
          </div>
          {currentPlace ? (
            <>
              <PDPlaceReviews user={currentUser} placeID={currentPlace.id} />
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}

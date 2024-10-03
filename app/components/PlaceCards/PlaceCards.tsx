"use client";
import { AddPlaydate } from "@/utils/actions/playdateActions";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { amenityIcons, amenityList } from "@/utils/map/amenityList";
import supabaseClient from "@/utils/supabase/client";
import {
  AmenityReview,
  placeReviewType,
  placesDataType,
} from "@/utils/types/placeTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { PostgrestError } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

type PlaceCardsProps = {
  place: placesDataType;
};

type KidsNameType = {
  first_name: string;
  last_name: string;
  id: string;
};

// const PlaceCards: React.FC<PlaceCardsProps> = ({ place, kids, currentUserID }: {place:placesDataType, kids?:KidsNameType, currentUserID:string}) => {
export default function PlaceCards({
  place,
  kids,
  currentUserID,
}: {
  place: placesDataType;
  kids?: KidsNameType[];
  currentUserID?: string;
}) {
  const router = useRouter();
  const [showMore, setShowMore] = useState<boolean>(false);
  const [openSelectKid, setOpenSelectKid] = useState<boolean>(false);
  const [selectedKid, setSelectedKid] = useState<string>("");
  const [userReviewStars, setUserReviewStars] = useState<number | null>(null);
  const [placeAmenities, setPlaceAmenities] = useState<AmenityReview | null>(
    null,
  );
  const addressElement = document.getElementById(`${place.id}Address`);
  const summaryElement = document.getElementById(`${place.id}Summary`);
  const linkElement = document.getElementById(`${place.id}Link`);
  const addressElementRef = useRef<HTMLDivElement>();
  const summaryElementRef = useRef<HTMLDivElement>();
  const linkElementRef = useRef<HTMLDivElement>();
  const selectedKidForPlaydateRef = useRef<HTMLSelectElement>(null);

  //set number of stars for rating need to combine into one function that can be called instead of separate. is state needed?

  const fullStars = place.rating ? Math.floor(place.rating) : 0;
  const halfStars = place.rating ? (place.rating % 1 >= 0.5 ? 1 : 0) : 0;
  const emptyStars = place.rating ? 5 - fullStars - halfStars : 5;

  const userFullStars = userReviewStars ? Math.floor(userReviewStars) : 0;
  const userHalfStars = userReviewStars
    ? userReviewStars % 1 >= 0.5
      ? 1
      : 0
    : 0;
  const userEmptyStars = userReviewStars
    ? 5 - userFullStars - userHalfStars
    : 5;

  const handleStartPlaydate = async () => {
    if (!kids) {
      return;
    }
    if (!currentUserID) {
      return;
    }
    try {
      const newPlaydateData = {
        location: place.id,
        host_id: currentUserID,
        //kid is either selected or the default if there's only one kid in the array
        host_kid_id: selectedKidForPlaydateRef?.current?.value || kids[0].id,
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
    setShowMore((previousValue) => !previousValue);
  };

  const getUserReviews = async () => {
    try {
      const {
        data: reviewData,
        error: reviewDataError,
      }: { data: placeReviewType[] | null; error: PostgrestError | null } =
        await supabaseClient
          .from("Location_Reviews")
          .select("*")
          .eq("google_place_id", place.id);
      if (reviewDataError) {
        throw new Error("Error getting playdate user ");
      }
      //set PD user review stars
      if (reviewData && reviewData.length > 0) {
        const sum = reviewData?.reduce((sum, review) => sum + review.stars, 0);
        const average = Math.round(sum / reviewData.length);
        setUserReviewStars(average);

        //set list of user review amenities
        setPlaceAmenities(aggregateAmenities(reviewData));
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  //replace with useGSAP toi smooth out animations and opacity change. switch to refs but figure out if needs to be unique

  useEffect(() => {
    const placeCardDetails = document.getElementById(
      `${place.id}Details`,
    ) as HTMLDivElement;
    const summaryHeight = summaryElement?.offsetHeight || 0;
    const addressHeight = addressElement?.offsetHeight || 0;
    const linkHeight = linkElement?.offsetHeight || 0;
    if (showMore) {
      placeCardDetails.style.height = `${summaryHeight + addressHeight + linkHeight + 100}px`;
    } else {
      placeCardDetails.style.height = "0px";
    }
    getUserReviews();
  }, [
    showMore,
    addressElement?.offsetHeight,
    place.id,
    summaryElement?.offsetHeight,
    linkElement?.offsetHeight,
    openSelectKid,
  ]);

  return (
    <div
      id={place.id}
      className="mb-12 flex min-h-28 w-9/12 flex-col justify-between gap-2 overflow-hidden rounded-xl border-2 border-appBlue"
    >
      <section id="placeCardDetails" className="flex flex-col">
        <div className="min-h-14 w-full p-2">
          <h2 className="mb-2 w-full text-left text-lg font-bold">
            {place.displayName.text}
          </h2>

          {place.currentOpeningHours?.openNow ||
          place.currentOpeningHours === undefined ? null : (
            <div className="mb-1 text-xs text-red-500">Currently closed</div>
          )}
          <div id="starRatings" className="flex items-center text-xs">
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
            {place.rating ? `${place.rating} stars on Google` : "No ratings"}
          </div>
          {userReviewStars ? (
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
          ) : null}
        </div>
        <div id="placeAmenities" className="mt-2 flex flex-wrap px-2">
          {placeAmenities &&
            (Object.keys(placeAmenities) as Array<keyof AmenityReview>).map(
              (amenity) =>
                placeAmenities[amenity] ? (
                  <Image
                    key={`${amenity}${place.id}`}
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
        {place?.formattedAddress ? (
          <p className="px-2 text-xs">{place.formattedAddress}</p>
        ) : null}
        {place?.internationalPhoneNumber ? (
          <p className="px-2 text-xs">{place.internationalPhoneNumber}</p>
        ) : null}
      </section>
      <section
        id="placeCardMoreInfo"
        className="items-between flex h-fit min-h-12 w-full flex-col justify-between border-t-2 border-appBlue bg-appGold"
      >
        <div
          id="moreToggleContainer"
          className="flex w-full transform cursor-pointer items-center justify-center py-4 duration-300 ease-in-out hover:scale-150"
          onClick={() => setShowMore((previousState) => !previousState)}
        >
          <Image
            src={`/icons/down_arrow.webp`}
            width={15}
            height={16}
            alt="down icon to show more details"
            title="more details"
            className={`transform duration-700 ease-in-out ${showMore ? "-rotate-180" : "rotate-0"} `}
          ></Image>
        </div>
        <section
          id={`${place.id}Details`}
          className={`w-100 mt-2 overflow-y-hidden p-1 transition-all duration-700 ease-in-out ${showMore ? `opacity-100` : "opacity-0"}`}
        >
          {place.editorialSummary ? (
            <>
              <p id={`${place.id}Summary`} className="mb-4 px-2 pb-4 text-sm">
                {place.editorialSummary.text}
              </p>
            </>
          ) : null}
          <div
            id={`${place.id}Link`}
            className="flex flex-col items-center justify-center gap-4"
          >
            <Link href={`/place/${place.id}`} className="flex justify-center">
              <button className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
                More information...
              </button>
            </Link>
            {
              //make sure to call created generic function at the end of the switch statement
              (() => {
                switch (true) {
                  case currentUserID && kids && kids?.length === 1:
                    return (
                      <button
                        className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                        onClick={handleStartPlaydate}
                      >
                        Start a Playdate here...
                      </button>
                    );
                  case currentUserID && kids && kids?.length > 1:
                    return (
                      <button
                        className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                        onClick={() =>
                          setOpenSelectKid((previousValue) => !previousValue)
                        }
                      >
                        {openSelectKid === true
                          ? "Cancel playdate"
                          : "Start a Playdate here..."}
                      </button>
                    );
                  default:
                    return (
                      <p className="text-xs">
                        You must be logged in and have kids associated with your
                        account in order to start a Playdate
                      </p>
                    );
                }
              })()
            }
            {openSelectKid && kids && kids.length > 1 ? (
              <section>
                <p>Who is this playdate for?</p>
                <select
                  ref={selectedKidForPlaydateRef}
                  value=""
                  onChange={async (e) => {
                    setSelectedKid(e.target.value);
                    await handleStartPlaydate();
                  }}
                  className="mb-4"
                >
                  <option value="" disabled>
                    Select which kid..
                  </option>
                  {kids.map((kid, index) => (
                    <option key={index} value={kid.id}>
                      {kid.first_name} {kid.last_name}
                    </option>
                  ))}
                </select>
              </section>
            ) : null}
          </div>
        </section>
      </section>
    </div>
  );
}

// export default PlaceCards;

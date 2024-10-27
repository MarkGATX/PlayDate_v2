import supabaseClient from "@/utils/supabase/client";
import { placeReviewType } from "@/utils/types/placeTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import Link from "next/link";
import { Delta } from "quill/core";
import { useEffect, useState } from "react";

export default function PDPlaceReviews({
  placeID,
  user,
}: {
  placeID: string;
  user?: AdultsType;
}) {
  const [locationReviews, setLocationReviews] = useState<placeReviewType[]>();
  const [averageStars, setAverageStars] = useState<number>();
  const [halfStars, setHalfStars] = useState<number>(0);
  const [fullStars, setFullStars] = useState<number>(0);
  const [emptyStars, setEmptyStars] = useState<number>(0);
  const [decimal, setDecimal] = useState<number>(0);

  useEffect(() => {
    const getPlaceReview = async () => {
      try {
        const { data: placeReviewData, error: placeReviewDataError } =
          await supabaseClient
            .from("Location_Reviews")
            .select("*, Adults(first_name, last_name, firebase_uid)")
            .eq("google_place_id", placeID);
        if (placeReviewDataError) {
          throw placeReviewDataError;
        }
        console.log(placeReviewData);
        setLocationReviews(placeReviewData);

        let totalStars = placeReviewData.reduce(
          (sum: number, review: placeReviewType) => sum + review.stars,
          0,
        );
        let averageStars = totalStars / placeReviewData.length;

        const fullStars = averageStars ? Math.floor(averageStars) : 0;
        const halfStars = averageStars ? (averageStars % 1 >= 0.5 ? 1 : 0) : 0;
        const emptyStars = averageStars ? 5 - fullStars - halfStars : 5;

        setFullStars(fullStars);
        setHalfStars(halfStars);
        setEmptyStars(emptyStars);
        if (typeof averageStars !== "number") {
          setAverageStars(0); // or any other default value
        } else {
          setAverageStars(parseFloat(averageStars.toFixed(1)));
        }
      } catch (error) {
        console.error(error);
      }
    };
    getPlaceReview();
  }, [placeID]);

  return (
    <>
      {locationReviews && locationReviews.length > 0 ? (
        <div>
          <div className="w-full bg-blueGradient bg-appBlue p-4 text-appBG">
            <h3 className="">Playdate User Reviews...</h3>

            <div className="flex items-center text-sm">
              <p className="mr-2">{averageStars}</p>
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
              <p className="text-xs">
                ({locationReviews?.length} Playdate reviews)
              </p>
            </div>
          </div>
          <div className="w-full px-4">
            {locationReviews.map((review) => {
              return (
                <div key={review.id}>
                  <Link href={`/place/${placeID}./PlaceReview/${review.id}`} >
                    <div className="my-4 flex flex-col rounded-lg border-2 border-appBlue p-2 transition-all hover:scale-105">
                      <div className="mb-2 flex">
                        <Image
                          src={
                            review.stars >= 1
                              ? `/icons/star.webp`
                              : `/icons/empty-star.webp`
                          }
                          className="mr-1"
                          width={24}
                          height={24}
                          alt="Empty star"
                        ></Image>
                        <Image
                          src={
                            review.stars >= 2
                              ? `/icons/star.webp`
                              : `/icons/empty-star.webp`
                          }
                          className="mr-1"
                          width={24}
                          height={24}
                          alt="Empty star"
                        ></Image>
                        <Image
                          src={
                            review.stars >= 3
                              ? `/icons/star.webp`
                              : `/icons/empty-star.webp`
                          }
                          className="mr-1"
                          width={24}
                          height={24}
                          alt="Empty star"
                        ></Image>
                        <Image
                          src={
                            review.stars >= 4
                              ? `/icons/star.webp`
                              : `/icons/empty-star.webp`
                          }
                          className="mr-1"
                          width={24}
                          height={24}
                          alt="Empty star"
                        ></Image>
                        <Image
                          src={
                            review.stars >= 5
                              ? `/icons/star.webp`
                              : `/icons/empty-star.webp`
                          }
                          className="mr-1"
                          width={24}
                          height={24}
                          alt="Empty star"
                        ></Image>
                      </div>
                      {review.reviewer_notes_plain_text ? (
                        <>
                          <p className="text-sm">
                            {review.reviewer_notes_plain_text?.slice(0, 101)}
                            {review.reviewer_notes_plain_text.length > 100
                              ? "..."
                              : null}{" "}
                          </p>
                          <p className="text-sm font-bold">Click to see more</p>
                        </>
                      ) : null}
                      <h3 className="self-end text-sm">
                        - {review.Adults.first_name}
                      </h3>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

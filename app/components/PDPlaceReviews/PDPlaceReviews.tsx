import supabaseClient from "@/utils/supabase/client";
import { placeReviewType } from "@/utils/types/placeTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { useEffect, useState } from "react";

export default function PDPlaceReviews({ placeID, user }: { placeID: string, user?: AdultsType }) {
    const [locationReviews, setLocationReviews] = useState<placeReviewType>();


    useEffect(() => {
        const getPlaceReview = async () => {
            try {
                const { data: placeReviewData, error: placeReviewDataError } = await supabaseClient
                    .from('Location_Reviews')
                    .select('*')
                    .eq('google_place_id', placeID)
                if (placeReviewDataError) {
                    throw placeReviewDataError;
                }
                console.log(placeReviewData)

            } catch (error) {
                console.error(error)
            }
        }
        getPlaceReview();
    })

    return (
        <div>Place review</div>
    )
}
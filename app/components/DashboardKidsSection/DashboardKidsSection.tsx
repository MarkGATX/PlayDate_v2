import supabaseClient from "@/utils/supabase/client";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { useEffect, useState } from "react";
import KidsCard from "../KidsCard/KidsCard";


export default function DashboardKidsSection({ adultData }: { adultData: AdultsType }) {
    const [kids, setKids] = useState<KidsType[]>([])

    // useEffect(() => {
    //     const subscription = supabaseClient
    //         .channel('public:Adult_Kid')
    //         .on(
    //             'postgres_changes',
    //             {
    //                 event:'*',
    //                 schema: 'public',
    //                 table:'Adult_Kid',
    //                 filter:'adult_id=eq.adultData.id'
    //             },
    //             (payload) => {
    //                 console.log('subscription payload: ', payload);

    //             })
    //         .subscribe();

    //         return () => {
    //             supabaseClient.removeChannel(subscription)

    //         }
    // },[])


    useEffect(() => {
        const getKidsData = async () => {
            const { data: kidsJoinData, error: kidsJoinDataError } = await supabaseClient
                .from('Adult_Kid')
                .select('*') // Select only the ID for efficiency
                .eq('adult_id', adultData.id);
            if (kidsJoinDataError) {
                throw kidsJoinDataError;
            }
            if (kidsJoinData) {
                const kidIds = kidsJoinData.map(kidJoin => kidJoin.kid_id);
                const { data: kidsData, error: kidsDataError } = await supabaseClient
                    .from('Kids')
                    .select('*')
                    .in('id', kidIds);
                if (kidsDataError) {
                    throw kidsDataError;
                }
                if (kidsData) {
                    setKids(kidsData);
                    console.log(kidsData)
                }
            }
        }

        const subscription = supabaseClient
            .channel('public')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Adult_Kid',
                    filter: `adult_id=eq.${adultData.id}`
                },
                (payload) => {
                    console.log(payload)
                    getKidsData();

                })
            .subscribe();

        getKidsData();

        return () => {
            supabaseClient.removeChannel(subscription)

        }
    }, [adultData.id])


    return (

        <>
            <h2 className='font-bold text-lg w-full'>Kids:</h2>
            {kids && kids?.length > 0
                ?
                kids.map((kid) => (
                    <KidsCard key={kid.id} kid={kid} currentUser={adultData.id} />
                ))
                :
                <p>No kids</p>
            }
        </>

    )
}
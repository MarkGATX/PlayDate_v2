import supabaseClient from "@/utils/supabase/client";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { useEffect, useRef, useState } from "react";
import KidsCard from "../KidsCard/KidsCard";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import DashboardNewKidsInfo from "../DashboardNewKidsInfo/DashboardNewKidsInfo";


export default function DashboardKidsSection({ adultData }: { adultData: AdultsType }) {
    const [kids, setKids] = useState<KidsType[]>([])
    const [showKids, setShowKids] = useState<boolean>(false)
    const kidsDashboardRef = useRef<HTMLDivElement | null>(null)

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
                }
            }
        }

        const kidSubscription = supabaseClient
            .channel('supabase_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Adult_Kid',
                    filter: `adult_id=eq.${adultData.id}`
                },
                (payload) => {
                    getKidsData();

                })
            .subscribe()

        getKidsData();

        return () => {
            supabaseClient.removeChannel(kidSubscription)
        }
    }, [adultData.id])

    const { contextSafe } = useGSAP();

    const handleShowKids = contextSafe(() => {

        if (kidsDashboardRef.current) {

            if (!showKids) {

                gsap.to(kidsDashboardRef.current, {

                    height: 'auto',
                    autoAlpha: 1,
                    ease: 'power2.inOut',
                    duration: .3,
                })
                setShowKids(previousValue => !previousValue)
            }
            else {
                gsap.to(kidsDashboardRef.current, {
                    height: 0,
                    autoAlpha: 0,
                    ease: 'power2.inOut',
                    duration: .3
                })
                setShowKids(previousValue => !previousValue)
            }
        }
    })

    return (

        <>
            <section id='kidsSection' className='w-full flex flex-col gap-2 mb-4'>
                <div className="flex justify-start align-center w-full items-center bg-appBlue text-appBG px-4">
                    <div className='bg-appGold p-2 rounded-md cursor-pointer hover:scale-125 transform ease-in-out duration-300' onClick={handleShowKids}>
                        <Image src={`/icons/down_arrow.webp`} width={15} height={16} alt='down icon to show more details' title='more details' className={`transform ease-in-out duration-700 ${showKids ? '-rotate-180' : 'rotate-0'} `}></Image>
                    </div>
                    <h2 className='p-4 text-left font-bold '>Kids:</h2>

                </div>
                <div ref={kidsDashboardRef} className='flex flex-col gap-2 px-4 h-0 opacity-0 overflow-y-hidden'>
                    {kids && kids?.length > 0
                        ?
                        kids.map((kid) => (
                            <KidsCard key={kid.id} kid={kid} currentUser={adultData.id} />
                        ))
                        :
                        <p>No kids</p>
                    }
                    {adultData?.id
                        ?
                        <DashboardNewKidsInfo currentUser={adultData} />
                        :
                        <div> You have to be logged in to do this</div>

                    }
                </div>

            </section>
        </>

    )
}
import supabaseClient from "@/utils/supabase/client";
import { PlaydateDashboardListType, PlaydateType } from "@/utils/types/playdateTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Define a type alias for the inferred type


export default function DashboardPlaydateSection({ adultData }: { adultData: AdultsType }) {
    // const [kids, setKids] = useState<KidsType[]>()
    const [playdates, setPlaydates] = useState<PlaydateDashboardListType[]>();
    const upcomingPlaydatesRef = useRef<HTMLDivElement | null>(null);
    const [showPlaydates, setShowPlaydates] = useState<boolean>(false)

    const { contextSafe } = useGSAP()

    let playdateReminderHeight: number = 0

    const handleShowplaydates = contextSafe(() => {
        console.log(upcomingPlaydatesRef.current?.offsetHeight)
        if (upcomingPlaydatesRef.current) {
            console.log('Element display style:', getComputedStyle(upcomingPlaydatesRef.current).display);
            console.log('Element visibility style:', getComputedStyle(upcomingPlaydatesRef.current).visibility);
            console.log('Element offsetHeight:', upcomingPlaydatesRef.current.offsetHeight);
            if (!showPlaydates) {

                gsap.to(upcomingPlaydatesRef.current, {

                    height: 'auto',
                    autoAlpha: 1,
                    ease: 'power2.inOut',
                    duration: .3,
                })
                setShowPlaydates(previousValue => !previousValue)
            }
            else {
                gsap.to(upcomingPlaydatesRef.current, {
                    height: 0,
                    autoAlpha: 0,
                    ease: 'power2.inOut',
                    duration: .3
                })
                setShowPlaydates(previousValue => !previousValue)
            }
        }
    })

    useEffect(() => {
        const getKidsData = async () => {
            const { data: kidsDataForPlaydate, error: kidsDataForPlaydateError } = await supabaseClient
                .from('Adult_Kid')
                .select('*')
                .eq('adult_id', adultData.id);
            if (kidsDataForPlaydateError) {
                throw kidsDataForPlaydateError;
            }
            if (kidsDataForPlaydate) {
                const updatedKids = await Promise.all(
                    kidsDataForPlaydate.map(async (kid) => {
                        const { data: playdatesForKid, error: playdatesForKidError } = await supabaseClient
                            .from('Playdate_Attendance')
                            .select('*, Playdates(location, host_id, time, host_notes, host_kid_id), Kids(first_name, last_name, first_name_only, profile_pic)')
                            .eq('kid_id', kid.kid_id);
                        if (playdatesForKidError) {
                            throw playdatesForKidError;
                        }

                        // return { ...kid, playdates: playdatesForKid.sort((a, b) => a.Playdates.time - b.Playdates.time)  };
                        return { ...kid, playdates: playdatesForKid };
                    })
                );
                const playdates = updatedKids.flatMap((kid) => kid.playdates);
                setPlaydates(playdates)
                // setKids(updatedKids);
                // console.log(updatedKids)
                console.log(playdates)
            }
        }
        getKidsData();
    }, [adultData])

    const renderPlaydateStatusAlert = (playdate: PlaydateDashboardListType) => {
        if (playdate.Playdates.host_kid_id === playdate.kid_id) {
            return (
                <div className='absolute left-2 top-0 opacity-75 font-bold text-purple-500 -rotate-12 text-2xl ' style={{ textShadow: `2px 2px 4px var(--appBlue)` }}>HOST!</div>
            );
        }
        switch (playdate.invite_status) {
            case ('accepted'):
                return (
                    <div className='absolute left-2 top-0 opacity-75 font-bold text-green-500 -rotate-12 text-2xl ' style={{ textShadow: `2px 2px 4px var(--appBlue)` }}>Going</div>
                );
            case ('rejected'):
                return (
                    <div className='absolute left-2 top-0 opacity-75  font-bold text-red-500 -rotate-12 text-2xl ' style={{ textShadow: `2px 2px 4px var(--appBlue)` }}>Not Going</div>
                );
            case ('maybe'):
                return (
                    <div className='absolute left-2 top-0 opacity-75  font-bold text-yellow-500 -rotate-12 text-2xl ' style={{ textShadow: `2px 2px 4px var(--appBlue)` }}>Maybe??</div>
                );
            case ('invited'):
                return (
                    <div className='absolute left-2 top-0 opacity-75 font-bold text-blue-300 -rotate-12 text-lg ' style={{ textShadow: `2px 2px 4px var(--appBlue)` }}>{`Haven't Decided`}</div>
                );
        }
    }

    // playdateDateObject.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) // "YYYY-MM-DD"

    return (
        <section id='currentPlaydates' className=' w-full flex flex-col gap-2 justify-center items-center mb-4' >
            <div className="flex justify-start align-center w-full items-center bg-appBlue text-appBG px-4">
                <div className='bg-appGold p-2 rounded-md cursor-pointer hover:scale-125 transform ease-in-out duration-300' onClick={handleShowplaydates}>
                    <Image src={`/icons/down_arrow.webp`} width={15} height={16} alt='down icon to show more details' title='more details' className={`transform ease-in-out duration-700 ${showPlaydates ? '-rotate-180' : 'rotate-0'} `}></Image>
                </div>
                <h2 className='p-4 text-left font-bold '>Upcoming Playdates</h2>

            </div>
            <div id='upcomingPlaydates' ref={upcomingPlaydatesRef} className='flex flex-col gap-2 px-4 h-0 opacity-0 overflow-y-hidden'>
                {playdates
                    ?
                    <>
                        {
                            playdates.map((playdate, index) => {
                                let playdateDateObject = new Date(playdate.Playdates.time)
                                return (
                                    <>

                                        <div key={`playdateReminderDetail${playdate.playdate_id}${index}`} className='w-full p-4 bg-inputBG rounded-lg flex gap-2 justify-start items-center flex-wrap relative'>
                                            <div id={`kidPlaydateReminderDetails${playdate.Kids.id}${index}`} className='w-full flex gap-2 items-center'>
                                                <div className='w-9 h-9 flex justify-center relative'>
                                                    <Image src={playdate.Kids.profile_pic || '/pics/generic_profile_pic.webp'} alt="invited kid's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }} ></Image>
                                                </div>
                                                <p><span className='font-bold'>{playdate.Kids.first_name}</span> has a playdate on <span className='font-bold'>{playdateDateObject.toLocaleString(undefined, { month: 'long', day: 'numeric' })}</span> at <span className='font-bold'>{playdateDateObject.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></p>
                                            </div>
                                            <div id={`kidPlaydateReminderButtons${playdate.Kids.id}${index}`} className='w-full flex gap-2 justify-start items-center'>
                                                <Link href={`/playdates/${playdate.playdate_id}`} className=''>
                                                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >More info...</button>
                                                </Link>
                                                <Link href='' className=''>
                                                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Change Status</button>
                                                </Link>
                                            </div>

                                            {renderPlaydateStatusAlert(playdate)}


                                        </div >
                                    </>
                                )
                            })
                        }
                    </>
                    :

                    <div>No playdates</div>
                }
            </div>
        </section >
    )
}
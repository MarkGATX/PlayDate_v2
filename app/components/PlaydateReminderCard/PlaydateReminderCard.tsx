import { PlaydateDashboardListType } from "@/utils/types/playdateTypeDefinitions";
import { acceptPlaydateInvite, deletePlaydate, maybePlaydateInvite, rejectPlaydateInvite } from "@/utils/actions/playdateActions";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// momoizing component to attempt to reduce re-renders and visual jumps
// export default function PlaydateReminderCard({ playdate, index }: { playdate: PlaydateDashboardListType, index: number }) {
function PlaydateReminderCard({ playdate, index }: { playdate: PlaydateDashboardListType, index: number }) {
    const [showStatusChange, setShowStatusChange] = useState<boolean>(false)
    const playdateChangeStatusRef = useRef<HTMLDivElement | null>(null)

    const { contextSafe } = useGSAP()

    const handleShowplaydates = contextSafe(() => {
        if (playdateChangeStatusRef.current) {
            // const changeButtonsHeight = playdateChangeStatusRef.current.offsetHeight
            if (!showStatusChange) {
                gsap.to(playdateChangeStatusRef.current, {
                    height: 'auto',
                    autoAlpha: 1,
                    ease: 'power2.inOut',
                    duration: .5,
                })
                setShowStatusChange(previousValue => !previousValue)
            }
            else {
                gsap.to(playdateChangeStatusRef.current, {
                    height: 0,
                    autoAlpha: 0,
                    ease: 'power2.inOut',
                    duration: .5
                })
                setShowStatusChange(previousValue => !previousValue)
            }
        }
    })

    const handleChangeToAccept = async () => {
        try {
            const change = await acceptPlaydateInvite(playdate.playdate_id, playdate.kid_id)
            handleShowplaydates();

        } catch (error) {
            console.error(error)
        }
    }

    const handleChangeToReject = async () => {
        try {
            const change = await rejectPlaydateInvite(playdate.playdate_id, playdate.kid_id)
            handleShowplaydates();
        } catch (error) {
            console.error(error)
        }

    }

    const handleChangeToMaybe = async () => {
        try {
            const change = await maybePlaydateInvite(playdate.playdate_id, playdate.kid_id)
            handleShowplaydates();
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeletePlaydate = async() => {
        deletePlaydate(playdate.playdate_id)
        handleShowplaydates();
    }

    const renderPlaydateStatusAlert = (playdate: PlaydateDashboardListType) => {
        if (playdate.Playdates.host_kid_id === playdate.kid_id) {
            return (
                <div className='z-10 absolute -left-2 -top-2 opacity-75 font-bold text-purple-500 -rotate-12 text-2xl border-purple-500 bg-appGold p-1 rounded-lg border-2 ' style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}>HOST!</div>
            );
        }
        switch (playdate.invite_status) {
            case ('accepted'):
                return (
                    <div className='absolute -left-2 -top-2 opacity-75 font-bold text-green-500 -rotate-12 text-2xl border-green-500 bg-appGold p-1 rounded-lg border-2 ' style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}>Going</div>
                );
            case ('rejected'):
                return (
                    <div className='absolute -left-2 -top-2 opacity-75 font-bold text-red-500 -rotate-12 text-2xl border-red-500 bg-appGold p-1 rounded-lg border-2 ' style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}>Not Going</div>
                );
            case ('maybe'):
                return (
                    <div className='absolute -left-2 -top-2 opacity-75 font-bold text-yellow-600 -rotate-12 text-2xl border-yellow-600 bg-appGold p-1 rounded-lg border-2 ' style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}>Maybe??</div>
                );
            case ('invited'):
                return (
                    <div className='absolute -left-2 -top-2 opacity-75 font-bold text-green-500 -rotate-12 text-2xl border-green-500 bg-appGold p-1 rounded-lg border-2 ' style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}>{`Haven't Decided`}</div>
                );
        }
    }

    let playdateDateObject = new Date(playdate.Playdates.time)

    return (
        playdate.invite_status === 'invited'
            ?
            null
            :
            <div key={`playdateReminderDetail${playdate.playdate_id}${index}`} className='w-full p-4 bg-inputBG rounded-lg flex gap-2 justify-start items-center flex-wrap relative mt-4'>
                <div id={`kidPlaydateReminderDetails${playdate.Kids.id}${index}`} className='w-full flex gap-2 items-center '>
                    <div className='w-1/5  rounded-full flex justify-center relative '>
                        <Image src={playdate.Kids.profile_pic || '/pics/generic_profile_pic.webp'} alt="invited kid's profile pic" width={48} height={48} className='rounded-full' style={{ objectFit: 'cover' }} ></Image>
                    </div>
                    <p className='w-4/5'><span className='font-bold'>{playdate.Kids.first_name}</span> has a playdate on <span className='font-bold'>{playdateDateObject.toLocaleString(undefined, { month: 'long', day: 'numeric' })}</span> at <span className='font-bold'>{playdateDateObject.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></p>
                </div>
                <div id={`kidPlaydateReminderButtons${playdate.Kids.id}${index}`} className='w-full flex gap-2 justify-start items-center'>
                    <Link href={`/playdates/${playdate.playdate_id}`} className=''>
                        <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >More info...</button>
                    </Link>
                    <Link href='' className=''>
                        <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleShowplaydates}>Change Status</button>
                    </Link>
                </div>
                <div id={`kidPlaydateChangeStatusButtons${playdate.Kids.id}${index}`} ref={playdateChangeStatusRef} className={`changeButtonContainer w-full  gap-2 justify-start items-center h-0 flex opacity-0`}>
                    {playdate.Playdates.host_kid_id === playdate.kid_id
                        ?
                        <button className='px-1 w-90 text-xs text-white cursor-pointer py-1 mt-2 bg-red-500 hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-red-500 border-white hover:border-red-500 rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => handleDeletePlaydate()} >Cancel Playdate</button>
                        :
                        <>
                            <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => handleChangeToAccept()} >Accept</button>
                            <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => handleChangeToReject()}>Reject</button>
                            <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={() => handleChangeToMaybe()}>Maybe</button>
                        </>
                    }
                </div>

                {renderPlaydateStatusAlert(playdate)}
            </div >
    )
}
 export default memo(PlaydateReminderCard)

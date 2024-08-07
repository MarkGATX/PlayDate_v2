import { deleteNotification } from "@/utils/actions/notificationActions"
import supabaseClient from "@/utils/supabase/client"
import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions"
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"

export default function ChangePlaydateTime({ notification, index }: { notification: NotificationDetailsType, index: number }) {
    const {id, playdate_time } = notification

    const handleDeleteNotification = async () => {
        deleteNotification(id)
    }

    let playdateTimeISO;
    if (playdate_time instanceof Date) {
        playdateTimeISO = playdate_time.toISOString();
    } else {
        playdateTimeISO = new Date(playdate_time).toISOString();
    }

    // Parse and format the playdate_time
    const newDate = DateTime.fromISO(playdateTimeISO).toLocaleString(DateTime.DATETIME_MED);

    console.log(notification)
    return (
        <section  className='bg-inputBG rounded-lg p-2 text-sm flex justify-between'>
            <div className='w-5/6'>
                <h3 className='font-bold'>{`There's been a Playdate time change.`}</h3>
                <p>The new time is {newDate}</p>
            </div>
            <div className='w-1/6 flex justify-end items-center' id='deleteNotification' >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" ><path d="M0 0h24v24H0z" fill="none" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className='cursor-pointer' onClick={handleDeleteNotification} /></svg>
            </div>
        </section>
    )
}
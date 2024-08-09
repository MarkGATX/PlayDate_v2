import { deleteNotification } from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions";
import { PlaydateAttendanceType } from "@/utils/types/playdateTypeDefinitions";
import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function UpdatePlaydateStatus(notification: NotificationDetailsType) {
    const { sender, kid, notification_type, receiver, id, playdate_id } = notification
    const [playdateStatus, setPlaydateStatus] = useState<PlaydateAttendanceType | null>(null);

    useEffect(() => {
        const getUpdatedPlaydateStatus = async () => {
            try {
                const { data: playdateStatusData, error: playdateStatusDataError }: { data: PlaydateAttendanceType[] | null; error: PostgrestError | null } = await supabaseClient
                    .from('Playdate_Attendance')
                    .select()
                    .eq('playdate_id', playdate_id)
                    .eq('kid_id', kid.id)

                if (playdateStatusDataError) {
                    throw (playdateStatusDataError)
                }
                if (playdateStatusData && playdateStatusData.length > 0) {
                    setPlaydateStatus(playdateStatusData[0])
                }
            } catch (error) {
                console.error(error)
            }
        }

        getUpdatedPlaydateStatus();
    }, [playdate_id, kid.id])

    const handleDeleteNotification = async () => {
        deleteNotification(id)

    }

    return (
        <section id='singleNotificationContainer' className='bg-inputBG rounded-lg p-2 text-sm flex justify-between'>
            <div className='w-5/6'>
                <span className='font-bold'>{sender.first_name} {sender.last_name}</span> approved your request to add <span className='font-bold'>{kid.first_name} {kid.last_name}</span>
            </div>
            <div className='w-1/6 flex justify-end items-center' id='deleteNotification' >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" ><path d="M0 0h24v24H0z" fill="none" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className='cursor-pointer' onClick={handleDeleteNotification} /></svg>
            </div>
        </section>
    )
}
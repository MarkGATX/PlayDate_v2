import { approveAddKidRequest, deleteNotification, denyAddKidRequest } from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType, NotificationsType } from "@/utils/types/notificationTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddKidRequestNotification from "./NotificationTypes/AddKidRequestNotification";
import ApprovedAddKidRequestNotification from "./NotificationTypes/ApprovedAddKidRequest";

export default function Notification({ notification, currentUser, reRender }: { notification: NotificationsType, currentUser: AdultsType, reRender: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [notificationDetails, setNotificationDetails] = useState<NotificationDetailsType>()
    const [errorMessage, setErrorMessage] = useState<string>()
    const [requestStatus, setRequestStatus] = useState<string>()
    const { sender_id, receiver_id, kid_id, notification_type, playdate_id } = notification
    useEffect(() => {
        const getNotificationDetails = async () => {
            try {
                const { data: senderData, error: senderDataError } = await supabaseClient
                    .from('Adults')
                    .select('*')
                    .eq('id', sender_id)
                    .single();
                if (senderDataError) {
                    throw senderDataError;
                }
                const { data: kidData, error: kidDataError } = await supabaseClient
                    .from('Kids')
                    .select('*')
                    .eq('id', kid_id)
                    .single()
                if (kidDataError) {
                    throw kidDataError;
                }
                if (senderData && kidData) {
                    setNotificationDetails({
                        id:notification.id,
                        sender: senderData,
                        kid: kidData,
                        notification_type: notification_type,
                        receiver:currentUser
                    })
                }


            } catch (error) {
                console.error('Error fetching notification details:', error);
            }
        };
        getNotificationDetails();
    }, [])

    console.log(notificationDetails)

    if (notificationDetails?.kid.primary_caregiver === currentUser.id && notificationDetails?.notification_type === 'Add kid request') {
        console.log('add kid request notification true')
        return (
            <AddKidRequestNotification notification={notificationDetails} reRender={reRender}/>
        )
    }

    if (currentUser.id && notificationDetails?.notification_type === 'Approved add kid request') {
        console.log('approved add kid notification true')
        return (
            <ApprovedAddKidRequestNotification notification={notificationDetails} reRender={reRender}/>
        )
    }
}
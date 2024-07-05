import { approveAddKidRequest, deleteNotification, denyAddKidRequest } from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType, NotificationsType } from "@/utils/types/notificationTypeDefinitions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import AddKidRequestNotification from "./NotificationTypes/AddKidRequestNotification";
import ApprovedAddKidRequestNotification from "./NotificationTypes/ApprovedAddKidRequest";



export default function Notification({ notification, currentUser, reRender }: { notification: NotificationsType, currentUser: AdultsType, reRender: React.Dispatch<React.SetStateAction<boolean>> }) {

    type NotificationActions = {
        type: 'FETCH_NOTIFICATION_DETAILS'
        payload?: NotificationDetailsType
    }

    const notificationReducer = (notificationDetails: NotificationDetailsType, action: NotificationActions) => {
        switch (action.type) {
            case 'FETCH_NOTIFICATION_DETAILS':
                // if (action.error) {
                //     return { ...notificationDetails, errorMessage: action.error.message };
                // }
                console.log('UPDATE NOTIFICATION STATE: ', action)
                return { ...notificationDetails, ...action.payload };
            default:
                return notificationDetails;
        }
    };

    const [errorMessage, setErrorMessage] = useState<string>()
    const [requestStatus, setRequestStatus] = useState<string>()
    const { sender_id, receiver_id, kid_id, notification_type, playdate_id } = notification

    const initialState: NotificationDetailsType = {
        id: notification.id,
        sender:
        {
            id: '',
            first_name: "",
            last_name: "",
            profilePicURL: ""
        },
        kid:
        {
            id: '',
            first_name: '',
            last_name: '',
            profile_pic: '',
            primary_caregiver:''
        },
        notification_type: notification_type,
        receiver: currentUser,
    };

    const [notificationDetails, dispatch] = useReducer(notificationReducer, initialState);

    useEffect(() => {
        const fetchNotificationDetails = async () => {
            try {
                const { data: senderData, error: senderDataError } = await supabaseClient
                    .from('Adults')
                    .select('id, first_name, last_name, profilePicURL')
                    .eq('id', sender_id)
                    .single();
                if (senderDataError) {
                    throw senderDataError;
                }
                const { data: kidData, error: kidDataError } = await supabaseClient
                    .from('Kids')
                    .select('id, first_name, last_name, profile_pic, primary_caregiver')
                    .eq('id', kid_id)
                    .single();
                if (kidDataError) {
                    throw kidDataError;
                }
                console.log(kidData)
                dispatch({
                    type: 'FETCH_NOTIFICATION_DETAILS',
                    payload: {
                        id: notification.id,
                        sender: senderData,
                        kid: kidData,
                        notification_type: notification.notification_type,
                        receiver: currentUser,
                    },
                });
            } catch (error) {
                // if (error instanceof Error) {
                //     dispatch({ type: 'FETCH_NOTIFICATION_DETAILS', error: error });
                // } else {
                    console.error('Error fetching notification details:', error);
                }
            // };          
        }
        fetchNotificationDetails();
    }, [currentUser, sender_id, kid_id, notification.notification_type, notification.id]); 
    console.log(notificationDetails)

    if (notificationDetails?.kid.primary_caregiver === currentUser.id && notificationDetails?.notification_type === 'Add kid request') {
        console.log('add kid request notification true')
        return (
            <AddKidRequestNotification notification={notificationDetails} reRender={reRender} />
        )
    }

    if (currentUser.id && notificationDetails?.notification_type === 'Approved add kid request') {
        console.log('approved add kid notification true')
        return (
            <ApprovedAddKidRequestNotification notification={notificationDetails} reRender={reRender} />
        )
    }
}
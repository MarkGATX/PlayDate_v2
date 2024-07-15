import { approveAddKidRequest, deleteNotification, denyAddKidRequest } from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType, NotificationsType } from "@/utils/types/notificationTypeDefinitions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import AddKidRequestNotification from "./NotificationCategories/AddKidRequestNotification";
import ApprovedAddKidRequestNotification from "./NotificationCategories/ApprovedAddKidRequest";



export default function Notification({ currentUser, reRender }: { currentUser: AdultsType, reRender: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [notifications, setNotifications] = useState<NotificationDetailsType[]>([])
    const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(true);


    useEffect(() => {
        const getCurrentNotifications = async () => {
            // setNotifications([])
            try {
                const { data: notificationData, error: notificationError } = await supabaseClient
                    .from('Notifications')
                    .select('*')
                    .eq('receiver_id', currentUser.id);

                if (notificationData && notificationData.length > 0) {
                    console.log(notificationData)
                    const updatedNotifications = await Promise.all(
                        notificationData.map(async (notification) => {
                            console.log('getinfo')
                            const { data: senderData, error: senderDataError } = await supabaseClient
                                .from('Adults')
                                .select('id, first_name, last_name, profilePicURL')
                                .eq('id', notification.sender_id)
                                .single();

                            if (senderDataError) {
                                throw senderDataError;
                            }

                            const { data: kidData, error: kidDataError } = await supabaseClient
                                .from('Kids')
                                .select('id, first_name, last_name, profile_pic, primary_caregiver')
                                .eq('id', notification.kid_id)
                                .single();

                            if (kidDataError) {
                                throw kidDataError;
                            }

                            return { ...notification, sender: senderData, kid: kidData, receiver: currentUser }; // Combine data into a single object
                        })
                    );

                    setNotifications(updatedNotifications);

                } else {
                    setNotifications([]); // Handle case where no notifications are found
                }
                setIsLoadingNotifications(false)
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        const notificationSubscription = supabaseClient
            .channel('public')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Notifications',
                    filter: `receiver_id=eq.${currentUser?.id}`
                },
                (payload) => {
                    console.log('NOTIFY PAYLOAD: ', payload)
                    getCurrentNotifications();

                })
            .subscribe();

        getCurrentNotifications();

        return () => {
            supabaseClient.removeChannel(notificationSubscription)
        }
    }, [currentUser]);

    return (
        <section id='notificationSection' className='w-full p-4'>
            <h2 className='font-bold text-lg w-full'>Notifications:</h2>
            {isLoadingNotifications
                ?
                <div>Loading notifications...</div>
                :
                (notifications && notifications.length > 0)
                    ?
                    notifications.map((notification) => {
                        console.log(notification)
                        switch (notification.notification_type) {
                            case 'Add kid request':
                                if (notification.kid.primary_caregiver === currentUser.id) {
                                    return (
                                        <AddKidRequestNotification notification={notification} reRender={reRender} />
                                    )
                                }
                                break;
                            case 'Approved add kid request':
                                if (currentUser.id) {
                                    return <ApprovedAddKidRequestNotification notification={notification} reRender={reRender} />;
                                }
                                break;
                            default:
                                return null;
                        }
                    })
                    :
                    <p>No notifications</p>
            }

        </section>
    )
}

import { approveAddKidRequest, deleteNotification, denyAddKidRequest } from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType, NotificationsType } from "@/utils/types/notificationTypeDefinitions";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AddKidRequestNotification({ notification}: { notification: NotificationDetailsType }) {
    const [errorMessage, setErrorMessage] = useState<string>()
    const [requestStatus, setRequestStatus] = useState<string>()
    const { sender, kid, notification_type, receiver } = notification
    // console.log(notification.receiver_id)

    const handleApproveAddRequest = async () => {
        setRequestStatus('loading')
        if (!kid.id) {
            console.error('Kid ID is undefined')
            setErrorMessage('There was a problem approving your request: Kid ID undefined')
            setRequestStatus('error')
            return
        }
        const newNotificationData = {
            new_parent_id: sender.id,
            sender_id: receiver.id,
            kid_id: kid.id
        }
        try {
            await approveAddKidRequest(newNotificationData)
            await deleteNotification(notification.id)
            setRequestStatus('success')
            //reRender dash
            // reRender(previousValue => !previousValue)
        } catch (error) {
            console.error(error)
            setRequestStatus('error')
        }
    }

    const handleDenyAddRequest = async () => {
        setRequestStatus('loading')
        if (!kid.id) {
            console.error('Kid ID is undefined')
            setErrorMessage('There was a problem denying your request: Kid ID undefined')
            setRequestStatus('error')
            return
        }
        //creating denial notification
        const newNotificationData = {
            sender_id: notification.receiver.id,
            receiver_id: sender.id,
            kid_id: kid.id
        }
        try {
            await denyAddKidRequest(newNotificationData)
            await deleteNotification(notification.id)
            setRequestStatus('success')
            //reRender dash
            // reRender(previousValue => !previousValue)
        } catch (error) {
            console.error(error)
            setRequestStatus('error')
        }
    }

    return (
        
           
            <>
                <section id='singleNotificationContainer' className='bg-inputBG rounded-lg p-2 flex flex-wrap gap-2 justify-between'>
                    <div id='senderProfilePicContainer' className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.sender.profilePicURL || '/pics/generic_profile_pic.webp'} alt="sender's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <div id='notificationMessageContainer' className='text-sm w-2/3 text-center'>
                        <span className='font-bold'>{notification.sender.first_name} {notification.sender.last_name}</span> requests to be added as a <span className='font-bold'>Parent</span> to <span className='font-bold'>{notification.kid.first_name} {notification.kid.last_name}</span>
                    </div>
                    <div id='senderProfilePicContainer' className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.kid.profile_pic || '/pics/generic_profile_pic.webp'} alt="sender's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <section id='requestResponseButtons' className="w-full flex justify-around">
                        <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleApproveAddRequest}>Approve</button>
                        <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleDenyAddRequest}>Deny</button>
                    </section>
                    {errorMessage
                        ?
                        <section id='errorMessageContainer' className='text-red-700'>
                            {errorMessage}
                        </section>
                        :
                        null}
                </section >

            </>
    )
}
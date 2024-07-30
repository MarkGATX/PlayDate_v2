import { deleteNotification } from "@/utils/actions/notificationActions";
import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions";

export default function ApprovedAddKidRequestNotification({ notification, reRender }: { notification: NotificationDetailsType, reRender: React.Dispatch<React.SetStateAction<boolean>>  }) {
    const { sender, kid, notification_type, receiver, id } = notification

    const handleDeleteNotification = async() => {
        deleteNotification(id)
        // reRender(previousValue => !previousValue)
    }

    return (
        <section id='singleNotificationContainer' className='bg-inputBG rounded-lg p-2 text-sm flex justify-between'>
            <div className='w-5/6'>
                <span className='font-bold'>{sender.first_name} {sender.last_name}</span> approved your request to add <span className='font-bold'>{kid.first_name} {kid.last_name}</span>
            </div>
            <div className='w-1/6 flex justify-end items-center' id='deleteNotification' >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" ><path d="M0 0h24v24H0z" fill="none" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className='cursor-pointer' onClick={handleDeleteNotification}/></svg>
            </div>
        </section>
    )
}
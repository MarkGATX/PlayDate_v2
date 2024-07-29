import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions";
import Image from "next/image";
import Link from "next/link";

export default function PlaydateInvite({ notification, index }: { notification: NotificationDetailsType, index: number }) {
    return (
        <>
            <section id='singleNotificationContainer' className='bg-inputBG rounded-lg p-2 flex flex-wrap gap-2 justify-between'>
                <div id={`notification${notification.id}${index}profilePics`} className='w-16'>
                    <div id={`parentProfilePicContainer${notification.sender.id}${index}`} className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.sender.profilePicURL || '/pics/generic_profile_pic.webp'} alt="parent's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>

                    </div>
                    <div id={`kidProfilePicContainer${notification.kid.id}${index}`} className='w-9 h-9 flex justify-center relative'>
                        <Image src={notification.kid.profile_pic || '/pics/generic_profile_pic.webp'} alt="kid's profile pic" fill={true} className='rounded-full -left-3' style={{ objectFit: 'cover' }}></Image>
                    </div>
                </div>
                <div id='notificationMessageContainer' className='text-sm w-2/3 text-center'>
                    <span className='font-bold'>{notification.sender.first_name} {notification.sender.last_name}</span> is inviting you to a playdate with <span className='font-bold'>{notification.kid.first_name} {notification.kid.first_name_only ? null : notification.kid.last_name}</span> 
                </div>
                <div id='senderProfilePicContainer' className='w-9 h-9 flex justify-center relative'>
                    <Image src={notification.kid.profile_pic || '/pics/generic_profile_pic.webp'} alt="sender's profile pic" fill={true} className='rounded-full' style={{ objectFit: 'cover' }}></Image>
                </div>
                <section id='requestResponseButtons' className="w-full flex justify-around">
                    <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >More Info...</button>
                    <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Yes</button>
                    <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >No</button>
                    <button className='px-1 w-28 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Maybe</button>
                </section>
                {/* {errorMessage
                    ?
                    <section id='errorMessageContainer' className='text-red-700'>
                        {errorMessage}
                    </section>
                    :
                    null
                } */}
            </section >

        </>
    )
}
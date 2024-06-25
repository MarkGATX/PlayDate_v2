import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useContext } from "react";

export default function KidSearchCard({ kidData, searchType, currentUserId }: { kidData: KidsType, searchType: string, currentUserId: string }) {
    console.log(currentUserId)
    return (
        <div id='kidSearchResultCard' className='h-48 border-2 rounded border-appBlue ml-4 w-36 p-2 bg-appBG flex flex-col items-center justify-between'>
            <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 bg-appBG overflow-hidden '>
                <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
            </div>
            <h2 className='text-center tex-sm'>{kidData.first_name} {kidData.first_name_only ? null : kidData.last_name}</h2>
            {searchType === 'addKidToParent'
                ?
                kidData.primary_caregiver === currentUserId //if current user is already primary, render nothing. else render card
                    ?
                    null
                    :
                    <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4'>Request add</button>
                :
                null
            }
        </div>
    )
}
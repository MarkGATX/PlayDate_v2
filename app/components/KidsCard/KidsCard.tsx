import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useState } from "react";
import SubmitButton from "../SubmitButton/SubmitButton";
import { EditKid } from "@/utils/actions/actions";

export default function KidsCard({ kid, currentUser }: { kid: KidsType, currentUser: string }) {
    const [editKidInfo, setEditKidInfo] = useState<boolean>(false)

    //use js bind method to include kid id in submitted form
    const editKidWithId = EditKid.bind(null,kid.id )

    const handleEditKid = async () => {
        setEditKidInfo(previousValue => !previousValue)
    }

    // const handleEditKid = async () => {
    //     setEditKidInfo(previousValue => !previousValue);
      
    //     // Call EditKid server action
    //     const response = await EditKid(formData); // Assuming you build formData
      
    //     if (response.success) { // Check for success response from server action
    //       console.log('Kid information updated successfully');
    //       // Update editKidData state with the newly updated data (optional)
    //     } else {
    //       console.error('Error updating kid information:', response.error);
    //       // Handle errors (e.g., display error message)
    //     }
    //   };

    const cancelKidEdits = async () => {
        setEditKidInfo(false)
    }

    return (
        <div key={kid.id} className='singleKid flex flex-col bg-inputBG rounded-xl p-2 gap-4'>
            <div className='flex justify-between items-start gap-4 w-full '>
                <div id='kidProfilePicContainer' className='flex flex-col w-1/4 items-center justify-start'>
                    <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 bg-appBG overflow-hidden'>
                        <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                </div>
                <div className='w-3/4 flex flex-col gap-y-1'>
                    {editKidInfo ?
                        <form action={editKidWithId}>
                            {/* <input type="hidden" name="kidId" value={kid.id} /> */}
                            <input id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3' defaultValue={kid.first_name}></input> <input id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3 my-2' defaultValue={kid.last_name}></input>
                            <div className='block w-full text-xs'>
                                <input type='checkbox' id='showLastNameToggle' className='mr-2'></input><label htmlFor="showLastNameToggle">First name only</label>
                            </div>
                            <div className='block w-full text-xs'>
                                <label htmlFor="birthday" className='mr-2'>Birthday</label><input id='kidsBirthdayInput' name='birthday' type="date" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3' defaultValue={kid.birthday}></input>
                            </div>
                            <div className='block w-full text-xs'>
                                <SubmitButton text='Save New Info' />
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={cancelKidEdits}>Cancel</button>
                            </div>
                        </form>
                        :
                        <>
                            <p className='w-full'>{kid.first_name} {kid.last_name}</p>
                            {kid.primary_caregiver === currentUser
                                ?
                                <p className='rounded-lg bg-appGold p-1 text-xs border-appBlue max-w-fit'>Primary Caregiver</p>
                                :
                                null}
                            <div className='block w-full text-xs'>
                                {kid.first_name_only ? `Show only first name in search` : `Show full name in search`}
                            </div>
                            <div className='block w-full text-xs'>
                                <label htmlFor="birthday" className='mr-2'>Birthday: </label><input disabled type='date' id='birthday' className='w-4/6 rounded' value={kid.birthday ? kid.birthday : undefined}></input>
                            </div>
                            <div className='block w-full text-xs'>
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleEditKid}>Edit Kid Info</button>
                            </div>
                        </>
                    }

                </div>
            </div>
            {/* <div className='w-full'>
                                        <p className='text-sm'>Parents: parent names</p>
                                        <p className='text-sm'>Caregivers: caregiver names</p>
                                        <div className='flex justify-between w-full my-4'>
                                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Parent</button>
                                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Caregiver</button>
                                        </div>
                                    </div> */}
        </div>
    )
}
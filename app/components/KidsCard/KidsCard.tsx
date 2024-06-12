import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useState } from "react";
import SubmitButton from "../SubmitButton/SubmitButton";
import { EditKid } from "@/utils/actions/actions";
import { useFormStatus } from "react-dom";

export default function KidsCard({ kid, currentUser }: { kid: KidsType, currentUser: string }) {
    const [editKidInfo, setEditKidInfo] = useState<boolean>(false)
    const [kidFirstName, setKidFirstName] = useState<string>(kid.first_name)
    const [kidLastName, setKidLastName] = useState<string>(kid.last_name)
    const [kidBirthday, setKidBirthday] = useState<string | undefined>(kid.birthday)
    const [kidFirstNameOnly, setKidFirstNameOnly] = useState<boolean>(kid.first_name_only)
    const { pending } = useFormStatus()

    //use js bind method to include kid id in submitted form with form action
    // const editKidWithId = EditKid.bind(null,kid.id )

    const handleEditKid = async () => {
        setEditKidInfo(previousValue => !previousValue)
    }

    
    
    const saveKidEdits = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        const editedKidData: KidsType = {
       
            id: kid.id,
            first_name: kidFirstName.trim(),
            last_name: kidLastName.trim(),
            birthday: kidBirthday,
            first_name_only: kidFirstNameOnly,
            primary_caregiver: kid.primary_caregiver
        }
        console.log(editedKidData)
        if (!editedKidData.first_name || editedKidData.first_name === '') {
            return
        }
        if (!editedKidData.last_name || editedKidData.last_name === '') {
            return
        }

        try {
            const updateResponse = await EditKid(editedKidData)
            if (updateResponse) {
                setEditKidInfo(previousValue => !previousValue)
                console.log(updateResponse)
                
            } else {
                console.log('something else')
                console.log(updateResponse)
                setEditKidInfo(previousValue => !previousValue)
            }
        } catch (error) {
            console.log(error)
        }
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
        setKidFirstName(kid.first_name)
        setKidLastName(kid.last_name)
        setKidBirthday(kid.birthday)
        setKidFirstNameOnly(kid.first_name_only)
        setKidFirstNameOnly(kid.first_name_only)
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
                        <form >
                            {/* <form action={editKidWithId}> */}
                            <input id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3' value={kidFirstName} onChange={(event) => { setKidFirstName(event.target.value) }} ></input> <input id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" required={true} className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3 my-2' value={kidLastName} onChange={(event) => { setKidLastName(event.target.value) }}></input>
                            <div className='block w-full text-xs'>
                                <input type='checkbox' id='showLastNameToggle' className='mr-2' checked={kidFirstNameOnly} onChange={(event) => {setKidFirstNameOnly(event.target.checked)}}></input><label htmlFor="showLastNameToggle">First name only</label>
                            </div>
                            <div className='block w-full text-xs'>
                                <label htmlFor="birthday" className='mr-2'>Birthday</label><input id='kidsBirthdayInput' name='birthday' type="date" className='rounded border-2 border-appBlue p-1 text-sm ml-2 w-2/3' value={kidBirthday} onChange={(event) => { setKidBirthday(event.target.value) }}></input>
                            </div>
                            <div className='block w-full text-xs'>
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mr-2' onClick={(event) => saveKidEdits(event)} disabled={pending}>
                                    Save New Info
                                </button>
                                {/* <SubmitButton text='Save New Info' /> */}
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={cancelKidEdits}>Cancel</button>
                            </div>
                        </form>
                        :
                        <>
                            <p className='w-full'>{kidFirstName} {kidLastName}</p>
                            {kid.primary_caregiver === currentUser
                                ?
                                <p className='rounded-lg bg-appGold p-1 text-xs border-appBlue max-w-fit'>Primary Caregiver</p>
                                :
                                null}
                            <div className='block w-full text-xs'>
                                {kidFirstNameOnly ? `Show only first name in search` : `Show full name in search`}
                            </div>
                            <div className='block w-full text-xs'>
                                <label htmlFor="birthday" className='mr-2'>Birthday: </label><input disabled type='date' id='birthday' className='w-4/6 rounded' value={kidBirthday ? kidBirthday : undefined}></input>
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
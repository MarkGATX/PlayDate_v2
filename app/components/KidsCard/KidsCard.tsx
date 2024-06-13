import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SubmitButton from "../SubmitButton/SubmitButton";
import { EditKid } from "@/utils/actions/actions";
import { useFormStatus } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";


export default function KidsCard({ kid, currentUser }: { kid: KidsType, currentUser: string }) {
    const [editKidInfo, setEditKidInfo] = useState<boolean>(false)
    const [kidFirstName, setKidFirstName] = useState<string>(kid.first_name)
    const [kidLastName, setKidLastName] = useState<string>(kid.last_name)
    const [kidBirthday, setKidBirthday] = useState<string | undefined>(kid.birthday)
    const [kidFirstNameOnly, setKidFirstNameOnly] = useState<boolean>(kid.first_name_only)
    const [kidFirstNameBlank, setKidFirstNameBlank] = useState<boolean>(false)
    const [kidLastNameBlank, setKidLastNameBlank] = useState<boolean>(false)
    const { pending } = useFormStatus()
    const firstNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
    const lastNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
    const editFormRef = useRef<HTMLFormElement | null>(null)
    const readOnlyKidContentRef = useRef<HTMLDivElement | null>(null)

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
            setKidFirstNameBlank(true)
            if (firstNameErrorMessageRef.current) {
                //may need to add to useGSAP to make sure cleanup happens. use context safe. to add to useGSAP hook https://gsap.com/resources/React/
                gsap.to(firstNameErrorMessageRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '200px',
                        duration: 2,
                        ease: 'power1.out',
                        textContent: `First name can't be blank`
                    }
                )
            }
            return
        } else if (editedKidData.first_name) {
            setKidFirstNameBlank(false)
            if (firstNameErrorMessageRef.current) {
                gsap.to(firstNameErrorMessageRef.current,
                    {
                        autoAlpha: 0,
                        maxHeight: 0,
                        duration: 0.7,
                        ease: 'power1.out',
                        textContent: ``
                    }
                )
            }
        }
        if (!editedKidData.last_name || editedKidData.last_name === '') {
            setKidLastNameBlank(true)
            if (lastNameErrorMessageRef.current) {
                gsap.to(lastNameErrorMessageRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '200px',
                        duration: 2,
                        ease: 'power1.out',
                        textContent: `Last name can't be blank`
                    }
                )
            }
            return
        } else if (editedKidData.last_name) {
            setKidLastNameBlank(false)
            if (lastNameErrorMessageRef.current) {
                gsap.to(lastNameErrorMessageRef.current,
                    {
                        autoAlpha: 0,
                        maxHeight: 0,
                        duration: 0.7,
                        ease: 'power1.out',
                        textContent: ``
                    }
                )
            }
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
        setKidFirstNameBlank(false)
        setKidLastNameBlank(false)
    }

    // useEffect(() => {
    //     if (editKidInfo) {
    //         console.log('editing')
    //         gsap.from(editFormRef.current, {
    //             duration: 2,
    //             ease: 'power3.inOut',
    //             opacity: 1,
    //             // className: 'hidden', // Remove hidden class after animation
    //         });
    //         gsap.to(readOnlyKidContentRef.current, {
    //             duration: 2,
    //             ease: 'power1.out',
    //             opacity: 0,
    //             // onComplete: () => readOnlyKidContentRef.current.classList.add('hidden'), // Hide visually after animation
    //         });
    //     } else {
    //         gsap.to(editFormRef.current, {
    //             duration: 2,
    //             ease: 'power1.out',
    //             opacity: 0,
    //             // className: 'hidden', // Add hidden class before animation
    //         });
    //         gsap.from(readOnlyKidContentRef.current, {
    //             duration: 2,
    //             ease: 'power3.inOut',
    //             opacity: 1,
    //             // onComplete: () => readOnlyKidContentRef.current.classList.remove('hidden'), // Show visually after animation
    //         });
    //     }

    // }, [editKidInfo]);

    // useGSAP(() => {
    //     if (editKidInfo) {
    //         console.log('editing')
    //         gsap.from(editFormRef.current, {
    //             translateX:'0px',
    //             duration: 2,
    //             ease: 'power3.inOut',
    //             // opacity: 1,
    //             // display: 'block', // Remove hidden class after animation
    //             // autoAlpha:1
    //         });
    //         gsap.to(readOnlyKidContentRef.current, {
    //             duration: 2,
    //             translateX:'200%',
    //             ease: 'power1.out',
    //             // autoAlpha:0
    //             // opacity: 0,
    //             // display:'none'
    //             // onComplete: () => readOnlyKidContentRef.current.classList.add('hidden'), // Hide visually after animation
    //         });
    //     } 
    //     if (!editKidInfo) {
    //         gsap.to(editFormRef.current, {
    //             duration: 2,
    //             ease: 'power1.out',
    //             translateX: '200%',
    //             // opacity: 0,
    //             // display: 'none', // Add hidden class before animation
    //             // autoAlpha:0
    //         });
    //         gsap.from(readOnlyKidContentRef.current, {
    //             duration: 2,
    //             ease: 'power3.inOut',
    //             // autoAlpha:1,
    //             translateX: '0px'
    //             // opacity: 1,
    //             // display:'block'
    //             // onComplete: () => readOnlyKidContentRef.current.classList.remove('hidden'), // Show visually after animation
    //         });
    //     }

    // }, [editKidInfo]);


    return (
        <div key={kid.id} className='singleKid flex flex-col bg-inputBG rounded-xl p-2 gap-4 overflow-hidden'>
            <div className='flex justify-between items-start gap-4 w-full '>
                <div id='kidProfilePicContainer' className='flex flex-col w-1/4 items-center justify-start'>
                    <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 bg-appBG overflow-hidden'>
                        <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                </div>
                <div className='w-3/4 flex flex-col gap-y-1 transition-all'>
                    {editKidInfo ?
                        <form ref={editFormRef} >
                            {/* <form action={editKidWithId}> */}
                            <p id='firstNameErrorMessage' ref={firstNameErrorMessageRef} className='opacity-0 max-h-0 text-xs text-red-700 font-bold'></p>
                            <input id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" required={true} className={`rounded border-2 p-1 text-sm w-2/3 mb-2 ${kidFirstNameBlank ? 'border-red-700' : 'border-appBlue'}`} value={kidFirstName} onChange={(event) => { setKidFirstName(event.target.value) }} ></input>
                            <p id='lastNameErrorMessage' ref={lastNameErrorMessageRef} className='opacity-0 max-h-0 text-xs text-red-700 font-bold'></p>
                            <input id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" required={true} className={`rounded border-2 p-1 text-sm w-2/3 mb-2 ${kidLastNameBlank ? 'border-red-500' : 'border-appBlue'}`} value={kidLastName} onChange={(event) => { setKidLastName(event.target.value) }}></input>
                            <div className='flex w-full text-xs mb-2'>
                                <input type='checkbox' id='showLastNameToggle' className='mr-2' checked={kidFirstNameOnly} onChange={(event) => { setKidFirstNameOnly(event.target.checked) }}></input><label htmlFor="showLastNameToggle">First name only</label>
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
                        <div ref={readOnlyKidContentRef}>

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
                        </div>
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
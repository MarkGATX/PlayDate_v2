import { KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import SubmitButton from "../SubmitButton/SubmitButton";
import { DeleteKid, EditKid, removeAdultKidRelationship } from "@/utils/actions/actions";
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
    const [kidTooOld, setKidTooOld] = useState<boolean>(false)
    const [kidAge, setKidAge] = useState<number | undefined>(undefined)
    const [kidProfilePic, setKidProfilePic] = useState<string | undefined>(kid.profile_pic)
    const [openRemoveKidModal, setOpenRemoveKidModal] = useState<boolean>(false)
    const [openDeleteKidModal, setOpenDeleteKidModal] = useState<boolean>(false)
    const { pending } = useFormStatus()
    const firstNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
    const lastNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
    const birthdayErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
    const editFormRef = useRef<HTMLFormElement | null>(null)
    const readOnlyKidContentRef = useRef<HTMLDivElement | null>(null)
    const removeKidModalRef = useRef<HTMLDialogElement | null>(null)
    const deleteKidModalRef = useRef<HTMLDialogElement | null>(null)

    //use js bind method to include kid id in submitted form with form action
    // const editKidWithId = EditKid.bind(null,kid.id )

    const handleEditKid = async () => {
        setEditKidInfo(previousValue => !previousValue)
    }

    //calculate current age
    const findKidAge = useMemo(() => {
        if (kidBirthday) {
            const parsedKidBirthday = new Date(kidBirthday)
            const today = new Date()
            const kidAgeMS = today.getTime() - parsedKidBirthday.getTime()
            const kidAgeYears = kidAgeMS / (1000 * 60 * 60 * 24 * 365.25)
            // round age down
            setKidAge(Math.floor(kidAgeYears))
        }
    }, [kidBirthday])

    const saveKidEdits = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        const minDate = new Date(2000, 0, 1)
        const editedKidData: KidsType = {

            id: kid.id,
            first_name: kidFirstName.trim(),
            last_name: kidLastName.trim(),
            birthday: kidBirthday,
            first_name_only: kidFirstNameOnly,
            primary_caregiver: kid.primary_caregiver,
            profile_pic: kidProfilePic
        }

        if (kidBirthday) {
            const parsedKidEditedBirthday = new Date(kidBirthday)
            const today = new Date()
            const editedKidAgeMS = today.getTime() - parsedKidEditedBirthday.getTime()
            const editedKidAgeYears = editedKidAgeMS / (1000 * 60 * 60 * 24 * 365.25)
            if (editedKidAgeYears >= 19) {
                setKidTooOld(true)

                if (birthdayErrorMessageRef.current) {
                    // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
                    birthdayErrorMessageRef.current.innerText = 'Kids must be 18 or younger'
                    gsap.to(birthdayErrorMessageRef.current,
                        {
                            autoAlpha: 1,
                            maxHeight: '200px',
                            duration: 2,
                            ease: 'power1.out',
                            // textContent: 'Kids must be 18 or younger'
                        }
                    )
                }
                return //exit process
            } else {
                setKidTooOld(false)
                if (birthdayErrorMessageRef.current) {
                    // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
                    birthdayErrorMessageRef.current.innerText = ''
                    gsap.to(birthdayErrorMessageRef.current,
                        {
                            autoAlpha: 0,
                            maxHeight: 0,
                            duration: 2,
                            ease: 'power1.out',
                            // textContent: ``
                        }
                    )
                }
            }
        }

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
            return //exit process
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
            return //exit process
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

            } else {
                console.log('something else')
                console.log(updateResponse)
                setEditKidInfo(previousValue => !previousValue)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteKid = async () => {
        setOpenDeleteKidModal(true)
    }

    const handleConfirmDeleteKid = async () => {
        const deleteResult = await DeleteKid(kid.id)
        setOpenDeleteKidModal(false)
    }


    const handleRemoveKid = async () => {
        setOpenRemoveKidModal(true)
    }

    const handleConfirmRemoveKid = async () => {
        const removeResult = await removeAdultKidRelationship(currentUser, kid.id)
        setOpenRemoveKidModal(false)
    }

    const cancelKidEdits = async () => {
        setKidFirstName(kid.first_name)
        setKidLastName(kid.last_name)
        setKidBirthday(kid.birthday)
        setKidFirstNameOnly(kid.first_name_only)
        setKidFirstNameOnly(kid.first_name_only)
        setEditKidInfo(false)
        setKidFirstNameBlank(false)
        setKidLastNameBlank(false)
        setKidTooOld(false)
        setKidProfilePic(kid.profile_pic)
    }

    return (
        <>
            <div key={kid.id} className='singleKid flex flex-col bg-inputBG rounded-xl p-2 gap-4 overflow-hidden'>
                <div className='flex justify-between items-start gap-4 w-full '>
                    <div id='kidProfilePicContainer' className='flex flex-col w-1/4 items-center justify-start'>
                        <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 bg-appBG overflow-hidden'>
                            <Image src={kidProfilePic || '/pics/generic_profile_pic.webp'} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                        </div>
                        {/* <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button> */}
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
                                    <p id='birthdayErrorMessage' ref={birthdayErrorMessageRef} className='opacity-0 max-h-0 text-xs text-red-700 font-bold'></p>
                                    <label htmlFor="birthday" className='mr-2'>Birthday</label><input id='kidsBirthdayInput' name='birthday' type="date" className={`rounded border-2 p-1 text-sm ml-2 w-2/3 ${kidTooOld ? 'border-red-500' : 'border-appBlue'}`} value={kidBirthday} onChange={(event) => { setKidBirthday(event.target.value) }}></input>
                                </div>

                                <div id='defaultProfilePics' className="py-1 w-full flex flex-wrap gap-2 transition-all justify-center">
                                    <h4 className='font-bold text-xs w-full mb-2'>Choose default avatar</h4>
                                    <input type="radio" name="profile_pic" id="dinoProfilePic" value="/pics/dino_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/dino_profile_pic.webp'} />
                                    <label htmlFor="dinoProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/dino_profile_pic.webp" alt="Default Dino Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="dogProfilePic" value="/pics/dog_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/dog_profile_pic.webp'} />
                                    <label htmlFor="dogProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/dog_profile_pic.webp" alt="Default Dog Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="genericProfilePic" value="/pics/generic_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/generic_profile_pic.webp'} />
                                    <label htmlFor="genericProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/generic_profile_pic.webp" alt="Default generic Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="knightProfilePic" value="/pics/knight_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/knight_profile_pic.webp'} />
                                    <label htmlFor="knightProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/knight_profile_pic.webp" alt="Default knight Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="princessProfilePic" value="/pics/princess_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/princess_profile_pic.webp'} />
                                    <label htmlFor="princessProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/princess_profile_pic.webp" alt="Default princess Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="robot1ProfilePic" value="/pics/robot1_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/robot1_profile_pic.webp'} />
                                    <label htmlFor="robot1ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/robot1_profile_pic.webp" alt="Default robot1 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="robot2ProfilePic" value="/pics/robot2_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/robot2_profile_pic.webp'} />
                                    <label htmlFor="robot2ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/robot2_profile_pic.webp" alt="Default robot2 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="robot3ProfilePic" value="/pics/robot3_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/robot3_profile_pic.webp'} />
                                    <label htmlFor="robot3ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/robot3_profile_pic.webp" alt="Default robot3 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="superheroProfilePic" value="/pics/superhero_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/superhero_profile_pic.webp'} />
                                    <label htmlFor="superheroProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/superhero_profile_pic.webp" alt="Default superhero Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="unicornProfilePic" value="/pics/unicorn_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/unicorn_profile_pic.webp'} />
                                    <label htmlFor="unicornProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/unicorn_profile_pic.webp" alt="Default unicorn Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="fairyProfilePic" value="/pics/fairy_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/fairy_profile_pic.webp'} />
                                    <label htmlFor="fairyProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/fairy_profile_pic.webp" alt="Default fairy Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
                                    <input type="radio" name="profile_pic" id="ninjaProfilePic" value="/pics/ninja_profile_pic.webp" onChange={(event) => { setKidProfilePic(event.target.value) }} className='hidden' defaultChecked={kidProfilePic === '/pics/ninja_profile_pic.webp'} />
                                    <label htmlFor="ninjaProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                        <Image src="/pics/ninja_profile_pic.webp" alt="Default ninja Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                    </label>
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
                                <div className='w-full text-xs flex'>
                                    <label htmlFor="birthday" className='mr-2'>Birthday: </label><input disabled type='date' id='birthday' className='w-4/6 rounded' value={kidBirthday ? kidBirthday : undefined}></input>
                                </div>
                                <p className='text-xs'>{kidAge ? `${kidAge} years old` : null}</p>
                                <div className='block w-full text-xs'>
                                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton mr-2 active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleEditKid}>Edit Kid Info</button>
                                    {kid.primary_caregiver === currentUser
                                        ?
                                        <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleDeleteKid}>Delete Kid</button>
                                        :
                                        <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleRemoveKid}>Remove Kid</button>
                                    }
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
            {openRemoveKidModal
                ?
                <dialog ref={removeKidModalRef} className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className="bg-appGold m-auto p-4 rounded-xl w-3/4">
                        <div className="flex flex-col items-center flex-wrap text-sm">

                            <p className='block text-center mb-4'>This will remove your access to <span className='font-bold'>{kidFirstName} {kidLastName}</span>. </p>
                            <p className='block text-center mb-4'>This does NOT delete the kid from the system.</p>
                            <p className='block text-center mb-4'> Deleting can ONLY be done by the Primary Caregiver</p>
                            <p className='block text-center mb-4'>Do you want to remove <span className='font-bold'>{kidFirstName} {kidLastName}</span>?</p>
                            <br />
                            <div id='removeModalButtonContainer' className='flex flex-col w-full'>
                                <button type="button" className="px-1 w-full text-xs cursor-pointer py-1 mt-2 mb-4 hover:bg-red-800  active:shadow-activeButton mr-2  hover:text-white border-2 border-red-700 rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-appGold p-2" onClick={handleConfirmRemoveKid}>Remove {kidFirstName} {kidLastName}</button>
                                <button type="button" className="px-1 w-full text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none" onClick={() => setOpenRemoveKidModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </dialog>
                :
                null
            }
            {openDeleteKidModal
                ?

                <dialog ref={deleteKidModalRef} className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className="bg-appGold rounded-xl m-auto p-4 w-3/4">
                        <div className="flex flex-col items-center">

                            <p className='block text-center mb-4'>This will PREMANENTLY DELETE <span className='font-bold'>{kidFirstName} {kidLastName}</span> from the app. </p>
                            <p className='block text-center mb-4'>This CAN NOT be undone.</p>
                            <p className='block text-center mb-4'>Deleting can only be done by the Primary Caregiver</p>
                            <p className='block text-center mb-4'>Do you want to PERMANENTLY DELETE <span className='font-bold'>{kidFirstName} {kidLastName}</span>?</p>
                            <br />
                            <button type="button" className="px-1 w-full text-xs cursor-pointer py-1 mt-2 mb-4 hover:bg-red-800  active:shadow-activeButton mr-2  hover:text-white border-2 border-red-700 rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-appGold p-2 font-bold" onClick={handleConfirmDeleteKid}>DELETE {kidFirstName} {kidLastName}</button>
                            <button type="button" className="px-1 w-full text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none" onClick={() => setOpenDeleteKidModal(false)}>Cancel</button>

                        </div>
                    </div>
                </dialog>
                :
                null
            }
        </>
    )
}
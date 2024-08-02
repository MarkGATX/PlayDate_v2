import { EditAdult } from "@/utils/actions/actions"
import { AdultsType } from "@/utils/types/userTypeDefinitions"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Image from "next/image"
import { RefObject, createRef, useRef, useState } from "react"

export type editAdultFormErrorType = {
    firstNameError?: string
    lastNameError?: string
    phoneNumberError?: string
    emailError?: string
    profilePicError?: string
}


export default function DashboardAdultInfo({ user}: { user: AdultsType,}) {

    const [editAdultFormError, setEditAdultFormError] = useState<editAdultFormErrorType | null>(null)
    const [editAdultInfo, setEditAdultInfo] = useState<boolean>(false)
    const [adultFirstName, setAdultFirstName] = useState<string>(user.first_name)
    const [adultLastName, setAdultLastName] = useState<string>(user.last_name)
    const [adultPhoneNumber, setAdultPhoneNumber] = useState<string | undefined>(user.phone_number)
    const [adultEmail, setAdultEmail] = useState<string>(user.email)
    const [adultShowPhoneNumber, setAdultShowPhoneNumber] = useState(user.show_phone_number)
    const [adultShowEmail, setAdultShowEmail] = useState(user.show_email)
    const adultFirstNameInputRef = createRef<HTMLInputElement>()
    const adultLastNameInputRef = createRef<HTMLInputElement>()
    const adultEmailInputRef = createRef<HTMLInputElement>()
    const adultShowPhoneNumberInputRef = createRef<HTMLInputElement>()
    const adultShowEmailInputRef = createRef<HTMLInputElement>()
    const adultPhoneNumberInputRef = createRef<HTMLInputElement>()
    const adultFirstNameErrorRef = useRef<HTMLParagraphElement | null>(null)
    const adultLastNameErrorRef = useRef<HTMLParagraphElement | null>(null)
    const adultPhoneNumberErrorRef = useRef<HTMLParagraphElement | null>(null)
    const adultEmailErrorRef = useRef<HTMLParagraphElement | null>(null)


    const { contextSafe } = useGSAP()

    const cancelAdultEdits = async () => {
        setAdultFirstName(user.first_name)
        setAdultLastName(user.last_name)
        setAdultPhoneNumber(user.phone_number)
        setAdultEmail(user.email)
        setAdultShowPhoneNumber(user.show_phone_number)
        setAdultShowEmail(user.show_email)
        setEditAdultInfo(previousValue => !previousValue)
    }

    const showAdultInfoErrorMessage = contextSafe((messageRef: RefObject<HTMLElement>) => {
        gsap.to(messageRef.current, {
            height: '2em',
            autoAlpha: 1
        })
    })

    const closeAdultInfoErrorMessage = contextSafe((messageRef: RefObject<HTMLElement>) => {
        gsap.to(messageRef.current, {
            height: 0,
            autoAlpha: 0
        })
    })

    const handleSaveAdultInfoEdits = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        let formError: boolean = false
        const alphanumericRegex = /^[a-z0-9]+$/i;
        //error handling for fields
        // check first name field for empty or invalid
        if (adultFirstName === null || adultFirstName === undefined || !adultFirstName?.trim()) {
            setEditAdultFormError(prevState => ({
                ...prevState,
                firstNameError: `First name can't be blank`
            }))
            formError = true
            if (adultFirstNameErrorRef.current) {
                showAdultInfoErrorMessage(adultFirstNameErrorRef)
                adultFirstNameErrorRef.current.innerText = `First name can't be blank`
            }
        } else if (adultFirstName && !alphanumericRegex.test(adultFirstName)) {
            setEditAdultFormError(prevState => ({
                ...prevState,
                firstNameError: `First name can only be letters and numbers`
            }))
            formError = true
            if (adultFirstNameErrorRef.current) {
                adultFirstNameErrorRef.current.innerText = `First name can only be letters and numbers`
                showAdultInfoErrorMessage(adultFirstNameErrorRef)
            }
        } else {
            formError = false
            setEditAdultFormError(prevState => {
                const newState = { ...prevState };
                delete newState.firstNameError;
                return newState;
            }
            )
            // setEditAdultFormError({ firstNameError: undefined })
            if (adultFirstNameErrorRef.current) {
                adultFirstNameErrorRef.current.innerText = ``
                closeAdultInfoErrorMessage(adultFirstNameErrorRef)
            }
        }
        // check last name for empty or invalid
        if (adultLastName === null || adultLastName === undefined || !adultLastName?.trim()) {
            setEditAdultFormError(prevState => ({
                ...prevState,
                lastNameError: `Last name can't be blank`
            }))
            formError = true
            if (adultLastNameErrorRef.current) {
                adultLastNameErrorRef.current.innerText = `Last name can't be blank`
                showAdultInfoErrorMessage(adultLastNameErrorRef)
            }
        } else if (adultLastName && !alphanumericRegex.test(adultLastName)) {
            setEditAdultFormError(prevState => ({
                ...prevState,
                lastNameError: `Last name can only be letters and numbers`
            }))
            formError = true
            if (adultLastNameErrorRef.current) {
                adultLastNameErrorRef.current.innerText = `Last name can only be letters and numbers`
                showAdultInfoErrorMessage(adultLastNameErrorRef)
            }
        } else {
            formError = false
            setEditAdultFormError(prevState => {
                const newState = { ...prevState };
                delete newState.lastNameError;
                return newState;
            }
            )
            if (adultLastNameErrorRef.current) {
                adultLastNameErrorRef.current.innerText = ``
                closeAdultInfoErrorMessage(adultLastNameErrorRef)
            }
        }

        if (!formError && adultFirstName && adultLastName) {

            const editAdultData: Omit<AdultsType, 'firebase_uid' | 'profilePicURL' | 'Kids' | 'Adult_Kid' | 'emergency_contact'> = {
                first_name: adultFirstName.trim(),
                last_name: adultLastName.trim(),
                show_phone_number: adultShowPhoneNumber,
                show_email: adultShowEmail,
                phone_number: adultPhoneNumber,
                email: adultEmail,
                id: user.id

            }

            try {
                const editAdultResult = await EditAdult(editAdultData)
                console.log(editAdultResult)
                setEditAdultInfo(false)
                // reRender(previousValue => !previousValue)
                // toggleNewKidForm();
                // setReRenderEffect(previousValue => !previousValue)
            } catch (error) {

                console.log(error)
            }
        }
    }

    return (
        <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4' >
            {editAdultInfo
                ?
                <>
                    <div id='profileName' className='w-7/12'>

                        <input ref={adultFirstNameInputRef} id='adultFirstNameInput' name='first_name' type="text" placeholder="First name" onChange={(event) => setAdultFirstName(event.target.value)} required={true} value={adultFirstName} className={`rounded border-2 p-1 text-sm  w-full ${editAdultFormError?.firstNameError ? 'border-red-700' : 'border-appBlue'}`}></input>
                        <p ref={adultFirstNameErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                        <input ref={adultLastNameInputRef} id='adultLastNameInput' name='last' type="text" placeholder="Last name" onChange={(event) => setAdultLastName(event.target.value)} required={true} value={adultLastName} className={`rounded border-2 mt-2 p-1 text-sm  w-full ${editAdultFormError?.lastNameError ? 'border-red-700' : 'border-appBlue'}`}></input>
                        <p ref={adultLastNameErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                        <input ref={adultPhoneNumberInputRef} id='adultPhoneNumberInput' name='last' type="tel" placeholder="Phone number" onChange={(event) => setAdultPhoneNumber(event.target.value)} required={true} value={adultPhoneNumber} className={`rounded border-2 mt-2 p-1 text-sm  w-full ${editAdultFormError?.phoneNumberError ? 'border-red-700' : 'border-appBlue'}`}></input>
                        <p ref={adultPhoneNumberErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                        <input ref={adultEmailInputRef} id='adultEmailInput' name='last' type="email" placeholder="E-mail" onChange={(event) => setAdultEmail(event.target.value)} required={true} value={adultEmail} className={`rounded border-2 mt-2 p-1 text-sm  w-full ${editAdultFormError?.emailError ? 'border-red-700' : 'border-appBlue'}`}></input>
                        <p ref={adultEmailErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>
                    </div>
                    <div id='profilePicContainer' className='flex flex-col items-center'>
                        <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                            <Image src={user?.profilePicURL ? user.profilePicURL : `/pics/generic_profile_pic.webp`} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                        </div>
                        <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Change pic</button>
                    </div>
                    <div id='profileOptions' className='w-full'>
                        <div>
                            <input ref={adultShowPhoneNumberInputRef} id='adultShowPhoneNumber' type="checkbox" name='show_phone_number' className='rounded border-2 border-appBlue p-1 text-sm mx-2 ' onChange={(event) => setAdultShowPhoneNumber(event.target.checked)}></input>
                            <label htmlFor="adultShowPhoneNumber" className='text-sm w-1/2'>Show Phone Number to Connections</label>
                        </div>
                        <div>
                            <input ref={adultShowEmailInputRef} id='adultShowEmail' type="checkbox" name='show_phone_number' className='rounded border-2 border-appBlue p-1 text-sm mx-2 ' onChange={(event) => setAdultShowEmail(event.target.checked)}></input>
                            <label htmlFor="adultShowEmail" className='text-sm w-1/2'>Show Email to Connections</label>
                        </div>
                    </div>
                    <button className='px-1 w-full text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={(event) => handleSaveAdultInfoEdits(event)}>Save Edits</button>
                </>
                :
                <>
                    <div id='profileName' className='w-7/12'>
                        <h2 className='font-bold text-lg'>
                            {user?.first_name} {user?.last_name}
                        </h2>
                        <p className='text-xs'>{user?.phone_number ? user.phone_number : `No phone number`}</p>
                        <p className='text-xs'>{user?.email ? user.email : `No e-mail`}</p>
                    </div>
                    <div id='profilePicContainer' className='flex flex-col items-center'>
                        <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                            <Image src={user?.profilePicURL ? user.profilePicURL : `/pics/generic_profile_pic.webp`} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                        </div>

                    </div>
                    <div id='profileOptions' className='w-full'>
                        <fieldset className='text-sm'>
                            <div className='block'>
                                {user.show_phone_number
                                    ?
                                    <p>Show <span className='font-bold'>phone number</span> to connections</p>
                                    :
                                    <p>Do <span className="font-bold">NOT</span> show phone number to connections</p>
                                }
                            </div>
                            <div className='block'>
                                {user.show_email
                                    ?
                                    <p>Show <span className='font-bold'>email</span> to connections</p>
                                    :
                                    <p>Do <span className="font-bold">NOT</span> show email to connections</p>
                                }
                            </div>
                        </fieldset>
                    </div>
                </>
            }
            <button className='px-2 w-full text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' onClick={cancelAdultEdits}>{editAdultInfo ? `Cancel` : `Edit Profile`}</button>
        </section>
    )
}
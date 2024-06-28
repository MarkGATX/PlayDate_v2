'use client'
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
// import { createClient } from "@supabase/supabase-js";
import { AddKid } from "@/utils/actions/actions";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { RefObject, Suspense, createRef, useContext, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import supabaseClient from "@/utils/supabase/client";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { PostgrestError } from "@supabase/supabase-js";
import gsap from "gsap";
import KidsCard from "../components/KidsCard/KidsCard";
import KidSearchResults from "../components/KidSearchResults/KidSearchResults";
import KidSearchResultsSuspense from "../components/KidSearchResults/KidSearchResultsSuspense";
import { unstable_cache } from "next/cache";
import { useGSAP } from "@gsap/react";

// export const revalidate = 60

export type kidsArray = {
    kidsRawData?: KidsType[]
}

export type newKidFormErrorType = {
    firstNameError?: string
    lastNameError?: string
    birthdayError?: string
    profilePicError?: string
}

export type editAdultFormErrorType = {
    firstNameError?: string
    lastNameError?: string
    phoneNumberError?: string
    emailError?: string
    profilePicError?: string
}

export default function Dashboard() {
    const [reRenderEffect, setReRenderEffect] = useState<Boolean>(false)
    const { pending } = useFormStatus()
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState<string | undefined>()
    const { user } = useContext(AuthContext)
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    const [kidsData, setKidsData] = useState<kidsArray>();
    const [isLoadingKids, setIsLoadingKids] = useState(false);
    const [kidSearchTerm, setKidSearchTerm] = useState<string>('')
    const [newKidSectionOpen, setNewKidSectionOpen] = useState<boolean>(false)
    const [newKidFormError, setNewKidFormError] = useState<newKidFormErrorType | null>(null)
    const [editAdultFormError, setEditAdultFormError] = useState<editAdultFormErrorType | null>(null)
    const [editAdultInfo, setEditAdultInfo] = useState<Boolean>(false)
    const [newKidFirstName, setNewKidFirstName] = useState<string>();
    const [newKidLastName, setNewKidLastName] = useState<string>();
    const [newKidBirthday, setNewKidBirthday] = useState<string>();
    const [newKidFirstNameOnly, setNewKidFirstNameOnly] = useState<boolean>(false);
    const [newKidProfilePic, setNewKidProfilePic] = useState<string>();
    const newKidFormRef = useRef<HTMLDivElement | null>(null);
    const newKidSectionRef = useRef<HTMLElement | null>(null)
    const kidsFirstNameInputRef = createRef<HTMLInputElement>()
    const kidsLastNameInputRef = createRef<HTMLInputElement>()
    const kidsBirthdayInputRef = createRef<HTMLInputElement>()
    const kidsFirstNameOnlyInputRef = createRef<HTMLInputElement>()
    const kidsProfilePicInputRef = createRef<HTMLInputElement>()
    const saveNewKidButtonRef = useRef<HTMLButtonElement>(null)
    const firstNameErrorRef = useRef<HTMLParagraphElement | null>(null)
    const lastNameErrorRef = useRef<HTMLParagraphElement | null>(null)
    const birthdayErrorRef = useRef<HTMLParagraphElement | null>(null)
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
    const [newAdultFirstName, setAdultFirstName] = useState<string>()
    const [newAdultLastName, setAdultLastName] = useState<string>()
    const [newAdultPhoneNumber, setAdultPhoneNumber] = useState<string>()
    const [newAdultEmail, setAdultEmail] = useState<string>()
    const [newAdultShowPhoneNumber, setAdultShowPhoneNumber] = useState<boolean>()
    const [newAdultShowEmail, setAdultShowEmail] = useState<boolean>()
    // Track kid data loading state
    console.log(currentUser)
    console.log(user)

    // const getCachedUser = unstable_cache(
    //     async () =>  {
    //         try {
    //         const firebase_uid = user?.uid
    //         if (!firebase_uid) {
    //             return
    //         }
    //         const { data: adultData, error: adultError } = await supabaseClient
    //             .from('Adults')
    //             .select('*, Adult_Kid (*)') // Select only the ID for efficiency
    //             .eq('firebase_uid', firebase_uid);
    //         if (adultError) {
    //             throw adultError;
    //         }
    //         if (adultData) {
    //             const kidIds = adultData[0].Adult_Kid.map((akData: any) => akData.kid_id);
    //             console.dir(kidIds)
    //             const { data: kidsData, error: kidsError } = await supabaseClient
    //                 .from('Kids')
    //                 .select('*')
    //                 .in('id', kidIds)
    //             if (kidsError) {
    //                 throw kidsError;
    //             }
    //             if (kidsData) {
    //                 setCurrentUser({
    //                     ...adultData[0],
    //                     Kids: kidsData,
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },
    // ['cached-user-data'],
    // {tags:['currentUserData']}
    // )

    const { contextSafe } = useGSAP();

    useEffect(() => {
        const getCurrentUser = async () => {
            console.log('run get Current User from dash')
            // getCachedUser()
            try {
                const firebase_uid = user?.uid
                if (!firebase_uid) {
                    return
                }
                const { data: adultData, error: adultError } = await supabaseClient
                    .from('Adults')
                    .select('*, Adult_Kid (*)') // Select only the ID for efficiency
                    .eq('firebase_uid', firebase_uid);
                if (adultError) {
                    throw adultError;
                }
                if (adultData) {
                    const kidIds = adultData[0].Adult_Kid.map((akData: any) => akData.kid_id);
                    console.dir(kidIds)
                    const { data: kidsData, error: kidsError } = await supabaseClient
                        .from('Kids')
                        .select('*')
                        .in('id', kidIds)
                    if (kidsError) {
                        throw kidsError;
                    }
                    if (kidsData) {
                        setCurrentUser({
                            ...adultData[0],
                            Kids: kidsData,
                        });
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        getCurrentUser();
    }, [user, reRenderEffect])

    const showErrorMessage = contextSafe((messageRef: RefObject<HTMLElement>) => {
        gsap.to(messageRef.current, {
            height: '2em',
            autoAlpha: 1
        })
    })

    const closeErrorMessage = contextSafe((messageRef: RefObject<HTMLElement>) => {
        gsap.to(messageRef.current, {
            height: 0,
            autoAlpha: 0
        })
    })

    const toggleNewKidForm = contextSafe(() => {
        console.log(newKidSectionRef)
        if (newKidSectionRef.current) {
            const newKidSection = newKidSectionRef.current
            if (newKidSectionOpen) {
                gsap.to(newKidSectionRef.current, {
                    autoAlpha: 0,
                    height: '0',
                    duration: 0.5,
                    ease: 'power1.inOut',

                });

                if (kidsFirstNameInputRef.current) {
                    kidsFirstNameInputRef.current.value = ''
                }
                if (kidsLastNameInputRef.current) {
                    kidsLastNameInputRef.current.value = ''
                }
                if (kidsBirthdayInputRef.current) {
                    kidsBirthdayInputRef.current.value = ''
                }
                setNewKidFirstName('')
                setNewKidLastName('')
                setNewKidBirthday('')
                setNewKidProfilePic('')
                setKidSearchTerm('')

            } else {
                gsap.to(newKidSectionRef.current, {
                    autoAlpha: 1,
                    height: 'auto',
                    duration: 0.3,
                    ease: 'power1.inOut',
                    onComplete: () => {
                        console.log('animation complete')
                        // Scroll to top after animation completes
                        newKidSection.scrollIntoView({ behavior: "smooth" });
                    }
                });
            }
            setNewKidSectionOpen(previousValue => !previousValue)
        }
    })

    const handleAddNewKid = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        let formError: Boolean = false
        const alphanumericRegex = /^[a-z0-9]+$/i;
        //error handling for fields
        // check first name field for empty or invalid
        if (newKidFirstName === null || newKidFirstName === undefined || !newKidFirstName?.trim()) {
            setNewKidFormError(prevState => ({
                ...prevState,
                firstNameError: `First name can't be blank`
            }))
            formError = true
            if (firstNameErrorRef.current) {
                // gsap.to(firstNameErrorRef.current, {
                //     height: '2em',
                //     autoAlpha: 1
                // })
                showErrorMessage(firstNameErrorRef)
                firstNameErrorRef.current.innerText = `First name can't be blank`
            }
        } else if (newKidFirstName && !alphanumericRegex.test(newKidFirstName)) {
            setNewKidFormError(prevState => ({
                ...prevState,
                firstNameError: `First name can only be letters and numbers`
            }))
            formError = true
            if (firstNameErrorRef.current) {
                firstNameErrorRef.current.innerText = `First name can only be letters and numbers`
                // gsap.to(firstNameErrorRef.current, {
                //     height: '2em',
                //     autoAlpha: 1
                // })
                showErrorMessage(firstNameErrorRef)
            }
        } else {
            formError = false
            setNewKidFormError(prevState => {
                const newState = { ...prevState };
                delete newState.firstNameError;
                return newState;
            }
            )
            // setNewKidFormError({ firstNameError: undefined })
            if (firstNameErrorRef.current) {
                firstNameErrorRef.current.innerText = ``
                // gsap.to(firstNameErrorRef.current, {
                //     height: 0,
                //     autoAlpha: 0
                // })
                closeErrorMessage(firstNameErrorRef)
            }
        }
        // check last name for empty or invalid
        if (newKidLastName === null || newKidLastName === undefined || !newKidLastName?.trim()) {
            setNewKidFormError(prevState => ({
                ...prevState,
                lastNameError: `Last name can't be blank`
            }))
            formError = true
            if (lastNameErrorRef.current) {
                lastNameErrorRef.current.innerText = `Last name can't be blank`
                // gsap.to(lastNameErrorRef.current, {
                //     height: '2em',
                //     autoAlpha: 1
                // })
                showErrorMessage(lastNameErrorRef)
            }
        } else if (newKidLastName && !alphanumericRegex.test(newKidLastName)) {
            setNewKidFormError(prevState => ({
                ...prevState,
                lastNameError: `Last name can only be letters and numbers`
            }))
            formError = true
            if (lastNameErrorRef.current) {
                lastNameErrorRef.current.innerText = `Last name can only be letters and numbers`
                // gsap.to(lastNameErrorRef.current, {
                //     height: '2em',
                //     autoAlpha: 1
                // })
                showErrorMessage(lastNameErrorRef)
            }
        } else {
            formError = false
            setNewKidFormError(prevState => {
                const newState = { ...prevState };
                delete newState.lastNameError;
                return newState;
            }
            )
            if (lastNameErrorRef.current) {
                lastNameErrorRef.current.innerText = ``
                // gsap.to(lastNameErrorRef.current, {
                //     height: 0,
                //     autoAlpha: 0
                // })
                closeErrorMessage(lastNameErrorRef)
            }
        }
        // check birthday for empty or too old
        if (!newKidBirthday) {
            setNewKidFormError(prevState => ({
                ...prevState,
                birthdayError: `Birthday is required`
            }))
            formError = true
            if (birthdayErrorRef.current) {
                birthdayErrorRef.current.innerText = `Birthday is required`
                // gsap.to(birthdayErrorRef.current, {
                //     height: '2em',
                //     autoAlpha: 1
                // })
                showErrorMessage(birthdayErrorRef)
            }
        } else if (newKidBirthday) {
            const parsedKidEditedBirthday = new Date(newKidBirthday)
            const today = new Date()
            const editedKidAgeMS = today.getTime() - parsedKidEditedBirthday.getTime()
            const editedKidAgeYears = editedKidAgeMS / (1000 * 60 * 60 * 24 * 365.25)
            if (editedKidAgeYears >= 19) {
                setNewKidFormError(prevState => ({
                    ...prevState,
                    birthdayError: 'Kids must be 18 or younger'
                }))
                formError = true
                if (birthdayErrorRef.current) {
                    // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
                    birthdayErrorRef.current.innerText = 'Kids must be 18 or younger'
                    // gsap.to(birthdayErrorRef.current,
                    //     {
                    //         autoAlpha: 1,
                    //         maxHeight: '2em',
                    //     }
                    // )
                    showErrorMessage(birthdayErrorRef)
                }
            } else {
                setNewKidFormError(prevState => {
                    const newState = { ...prevState };
                    delete newState.birthdayError;
                    return newState;
                }
                )
                formError = false
                if (birthdayErrorRef.current) {
                    birthdayErrorRef.current.innerText = ``
                    // gsap.to(birthdayErrorRef.current, {
                    //     height: 0,
                    //     autoAlpha: 0
                    // })
                    closeErrorMessage(birthdayErrorRef)
                }

            }
        }

        if (!newKidProfilePic) {
            setNewKidProfilePic(`/pics/generic_profile_pic.webp`)
        }
        if (!currentUser) {
            console.log('return from current user false: ', currentUser)
            return
        }
        // build data and create new kid after double checking that fields are valid
        if (!formError && currentUser && newKidFirstName && newKidLastName && newKidBirthday && newKidProfilePic) {
            console.log('run new kid action')
            const rawAddKidData = {
                first_name: newKidFirstName.trim(),
                last_name: newKidLastName.trim(),
                birthday: newKidBirthday,
                first_name_only: newKidFirstNameOnly,
                primary_caregiver: currentUser.id,
                profile_pic: newKidProfilePic
            }

            try {
                const addKidResult = await AddKid(rawAddKidData)
                console.log(addKidResult)

                toggleNewKidForm();
                setReRenderEffect(previousValue => !previousValue)
            } catch (error) {

                console.log(error)
            }
        }
    }

    return (
        <main>
            <div className='w-full bg-appBlue text-appBG p-4 flex justify-center'>
                <h1 className='font-bold text-xl'>Dashboard</h1>
            </div>
            {!currentUser
                ?
                <>
                    <div className='w-full  p-4 '>You need to be logged in to see this page.</div>
                </>
                :
                <>
                    {editAdultInfo
                        ?
                        <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4'>
                            <div id='profileName' className='w-7/12'>

                                <input ref={adultFirstNameInputRef} id='adultFirstNameInput' name='first_name' type="text" placeholder="First name" onChange={(event) => setAdultFirstName(event.target.value)} required={true} value={currentUser?.first_name} className={`rounded border-2  p-1 text-sm  w-2/3 ${editAdultFormError?.firstNameError ? 'border-red-700' : 'border-appBlue'}`}></input>
                                <p ref={adultFirstNameErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                                <input ref={adultLastNameInputRef} id='adultLastNameInput' name='last' type="text" placeholder="Last name" onChange={(event) => setAdultLastName(event.target.value)} required={true} value={currentUser?.last_name} className={`rounded border-2  p-1 text-sm  w-2/3 ${editAdultFormError?.lastNameError ? 'border-red-700' : 'border-appBlue'}`}></input>
                                <p ref={adultLastNameErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                                <input ref={adultPhoneNumberInputRef} id='adultPhoneNumberInput' name='last' type="text" placeholder="Phone number" onChange={(event) => setAdultPhoneNumber(event.target.value)} required={true} value={currentUser?.phone_number} className={`rounded border-2  p-1 text-sm  w-2/3 ${editAdultFormError?.phoneNumberError ? 'border-red-700' : 'border-appBlue'}`}></input>
                                <p ref={adultPhoneNumberErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>

                                <input ref={adultEmailInputRef} id='adultEmailInput' name='last' type="text" placeholder="Last name" onChange={(event) => setAdultEmail(event.target.value)} required={true} value={currentUser?.last_name} className={`rounded border-2  p-1 text-sm  w-2/3 ${editAdultFormError?.emailError ? 'border-red-700' : 'border-appBlue'}`}></input>
                                <p ref={adultEmailErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>




                                {/* add toggle later for editing inputs */}
                                {/* <input inputMode="email"></input> */}

                            </div>
                            <div id='profilePicContainer' className='flex flex-col items-center'>
                                <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                                    <Image src={currentUser?.profilePicURL ? currentUser.profilePicURL : `/pics/generic_profile_pic.webp`} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                                </div>
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                            </div>
                            <div id='profileOptions' className='w-full'>
                                <label htmlFor="adultShowPhoneNumber" className='text-sm w-1/2'>Show First Name Only</label>
                                <input ref={adultShowPhoneNumberInputRef} id='adultShowPhoneNumber' type="checkbox" name='show_phone_number' className='rounded border-2 border-appBlue p-1 text-sm ml-2 ' onChange={(event) => setAdultShowPhoneNumber(event.target.checked)}></input>

                                <label htmlFor="adultShowEmail" className='text-sm w-1/2'>Show First Name Only</label>
                                <input ref={adultShowEmailInputRef} id='adultShowEmail' type="checkbox" name='show_phone_number' className='rounded border-2 border-appBlue p-1 text-sm ml-2 ' onChange={(event) => setAdultShowEmail(event.target.checked)}></input>
                            </div>

                        </section>
                        :
                        <section id='profileDetails' className='flex justify-between p-4 w-full flex-wrap gap-y-4'>
                            <div id='profileName' className='w-7/12'>
                                <h2 className='font-bold text-lg'>
                                    {currentUser?.first_name} {currentUser?.last_name}
                                </h2>
                                <p className='text-xs'>{currentUser?.phone_number ? currentUser.phone_number : `No phone number`}</p>
                                <p className='text-xs'>{currentUser?.email ? currentUser.email : `No e-mail`}</p>
                                {/* add toggle later for editing inputs */}
                                {/* <input inputMode="email"></input> */}

                            </div>
                            <div id='profilePicContainer' className='flex flex-col items-center'>
                                <div id='profilePic' className='relative w-20 h-20 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                                    <Image src={currentUser?.profilePicURL ? currentUser.profilePicURL : `/pics/generic_profile_pic.webp`} alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                                </div>
                                <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                            </div>
                            <div id='profileOptions' className='w-full'>
                                <fieldset className='text-sm'>
                                    <div className='block'>
                                    {currentUser.show_phone_number
                                            ?
                                            <p>Show <span className='font-bold'>phone number</span> to connections</p>
                                            :
                                            <p>Do <span className="font-bold">NOT</span> show phone number to connections</p>
                                        }
                                        
                                    </div>
                                    <div className='block'>
                                        {currentUser.show_email
                                            ?
                                            <p>Show <span className='font-bold'>email</span> to connections</p>
                                            :
                                            <p>Do <span className="font-bold">NOT</span> show email to connections</p>
                                        }
                                    </div>
                                </fieldset>
                            </div>

                        </section>
                    }

                    <section id='kidsSection' className='w-full p-4 flex flex-col gap-4'>
                        <h2 className='font-bold text-lg w-full'>Kids:</h2>
                        {currentUser && currentUser?.Kids.length > 0
                            ?
                            currentUser.Kids.map((kid) => (
                                <KidsCard key={kid.id} kid={kid} currentUser={currentUser.id} />
                            ))
                            :
                            null
                        }
                        {/* Make sure currentUser is true before rendering add kid form */}
                        {currentUser?.id
                            ?
                            <>
                                <section id='addNewKidSection' ref={newKidSectionRef} className='h-0 overflow-hidden rounded-xl p-2 opacity-0 border-2 border-appBlue'>
                                    <div>
                                        <h3 className='font-bold'>Search for kid...</h3>
                                        <input type='text' value={kidSearchTerm} placeholder={`Kid's name`} className='border-2 rounded-lg px-2 bg-inputBG  ' onChange={(event) => { setKidSearchTerm(event.target.value) }}></input>
                                        {/* <input type='text' value={kidSearchTerm} placeholder={`Kid's name`} className='border-2 rounded-lg px-2 bg-inputBG  ' onChange={(event) => handleSearchChange(event.target.value)}></input> */}
                                        <Suspense fallback={<KidSearchResultsSuspense />}>
                                            <KidSearchResults searchType='addKidToParent' currentUser={currentUser} searchTerm={kidSearchTerm} />
                                        </Suspense>
                                    </div>
                                    <h3 className='text-center w-full'>OR</h3>
                                    <div>
                                        <h3 className='font-bold'>Add new kid...</h3>
                                        <div id='newKidForm' ref={newKidFormRef}>
                                            <form id='addNewKidForm' className='flex justify-between flex-wrap'>

                                                <input type="hidden" name='primary_caregiver' value={currentUser.id} />
                                                <div className='pt-2 pb-1 flex flex-wrap justify-between w-full items-center'>
                                                    <label htmlFor="kidsFirstNameInput" className='text-sm w-1/3'>First Name</label>
                                                    <input ref={kidsFirstNameInputRef} id='kidsFirstNameInput' name='first_name' type="text" placeholder="First name" onChange={(event) => setNewKidFirstName(event.target.value)} required={true} className={`rounded border-2  p-1 text-sm  w-2/3 ${newKidFormError?.firstNameError ? 'border-red-700' : 'border-appBlue'}`}></input>
                                                    <p ref={firstNameErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>
                                                </div>
                                                <div className='pt-2 pb-1 flex flex-wrap justify-between w-full items-center'>
                                                    <label htmlFor="kidsLastNameInput" className='text-sm w-1/3'>Last Name</label>
                                                    <input ref={kidsLastNameInputRef} id='kidsLastNameInput' name='last_name' type="text" placeholder="Last name" required={true} onChange={(event) => setNewKidLastName(event.target.value)} className='rounded border-2 border-appBlue p-1 text-sm  w-2/3'></input>
                                                    <p ref={lastNameErrorRef} className='w-full text-xs h-0 opacity-0  text-red-700'></p>
                                                </div>
                                                <div className='pt-2 pb-1 flex flex-wrap justify-between w-full items-center'>
                                                    <label htmlFor="kidsBirthdayInput" className='text-sm w-1/3'>Birthday</label>
                                                    <input ref={kidsBirthdayInputRef} id='kidsBirthdayInput' name='birthday' type="date" className='rounded border-2 border-appBlue p-1 text-sm w-2/3' onChange={(event) => setNewKidBirthday(event.target.value)} required></input>
                                                    <p ref={birthdayErrorRef} className='w-full text-xs h-0 opacity-0 text-red-700'></p>
                                                </div>
                                                <div className='py-1'>
                                                    <label htmlFor="kidsShowLastNameInput" className='text-sm w-1/2'>Show First Name Only</label>
                                                    <input ref={kidsFirstNameOnlyInputRef} id='kidsShowLastNameInput' type="checkbox" name='first_name_only' className='rounded border-2 border-appBlue p-1 text-sm ml-2 ' onChange={(event) => setNewKidFirstNameOnly(event.target.checked)}></input>

                                                </div>
                                                <div id='defaultProfilePics' className="py-1 w-full flex flex-wrap gap-2 transition-all justify-center">
                                                    <h4 className='font-bold text-xs w-full mb-2'>Choose default avatar</h4>
                                                    <input type="radio" name="profile_pic" id="dinoProfilePic" value="/pics/dino_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/dino_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="dinoProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/dino_profile_pic.webp" alt="Default Dino Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="dogProfilePic" value="/pics/dog_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/dog_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="dogProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/dog_profile_pic.webp" alt="Default Dog Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="genericProfilePic" value="/pics/generic_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/generic_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="genericProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/generic_profile_pic.webp" alt="Default generic Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="knightProfilePic" value="/pics/knight_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/knight_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="knightProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/knight_profile_pic.webp" alt="Default knight Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="princessProfilePic" value="/pics/princess_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/princess_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="princessProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/princess_profile_pic.webp" alt="Default princess Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="robot1ProfilePic" value="/pics/robot1_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/robot1_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="robot1ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/robot1_profile_pic.webp" alt="Default robot1 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="robot2ProfilePic" value="/pics/robot2_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/robot2_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="robot2ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/robot2_profile_pic.webp" alt="Default robot2 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="robot3ProfilePic" value="/pics/robot3_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/robot3_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="robot3ProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/robot3_profile_pic.webp" alt="Default robot3 Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="superheroProfilePic" value="/pics/superhero_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/superhero_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="superheroProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/superhero_profile_pic.webp" alt="Default superhero Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="unicornProfilePic" value="/pics/unicorn_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/unicorn_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="unicornProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/unicorn_profile_pic.webp" alt="Default unicorn Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="fairyProfilePic" value="/pics/fairy_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/fairy_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="fairyProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/fairy_profile_pic.webp" alt="Default fairy Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                    <input type="radio" name="profile_pic" id="ninjaProfilePic" value="/pics/ninja_profile_pic.webp" className='hidden' checked={newKidProfilePic === '/pics/ninja_profile_pic.webp'} onChange={(event) => setNewKidProfilePic(event.target.value)} />
                                                    <label htmlFor="ninjaProfilePic" className='flex flex-col w-12 h-12  cursor-pointer items-center justify-start relative hover:scale-110 transition-all'>
                                                        <Image src="/pics/ninja_profile_pic.webp" alt="Default ninja Profile Pic" className='relative w-16 h-16 max-h-20 rounded-full border-appGold border-2 bg-appBG overflow-hidden' fill={true} style={{ objectFit: 'cover' }}></Image>
                                                    </label>
                                                </div>
                                                {/* <button type='submit' disabled={pending}>Save New Kid</button> */}
                                                <button ref={saveNewKidButtonRef} className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mr-2 ml-auto' disabled={pending} onClick={(event) => handleAddNewKid(event)} >
                                                    Save New Kid
                                                </button>
                                                {/* <SubmitButton text='Save New Kid' uiHandler={toggleNewKidForm} /> */}

                                            </form>
                                        </div>
                                    </div>
                                </section>
                            </>
                            :
                            <div> You have to be logged in to do this</div>

                        }

                        <button className='px-2 w-90 text-sm cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' onClick={toggleNewKidForm}>{newKidSectionOpen ? `Cancel` : `Add New Kid`}</button>


                    </section>
                    <section id='notificationSection' className='w-full p-4'>
                        <h2 className='font-bold text-lg w-full'>Notifications:</h2>
                    </section>
                </>

            }
        </main>
    )
}
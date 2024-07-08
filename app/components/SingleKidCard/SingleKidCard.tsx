import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect } from "react";

export default function SingleKidCard(kidId: string) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Missing Supabase URL or API key');
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // useEffect(() => {
    //     const getKidsList = async () => {

    //         const { data, error } = await supabase
    //             .from('Adults')
    //             .select('*, Kid(*) AS kids') // Select all adult columns and nested kid data
    //             .leftJoin('Adult_Kid', 'Adults.id', 'Adult_Kid.adult_id')
    //             .innerJoin('Kids', 'Adult_Kid.kid_id', 'Kids.id')
    //             .eq('Adults.id', adultId); // Replace 'adultId' with the actual adult ID

    //             SELECT Adults.*, Kids.*
    //             FROM Adults 
    //             LEFT JOIN Adult_Kid ON Adults.id = Adult_Kid.adult
    //             INNER JOIN Kids ON Adult_Kid.kid = kid.id
    //             WHERE Adults.id = $1;

    //         // .from('Adults')
    //         // .select('*') // Select only the ID for efficiency
    //         // .eq('firebase_uid', firebase_uid);
    //         if (data) {

    //         }
    //     }
    //     getKidsList();
    // }, [supabase])


    return (
        <div className='singleKid flex flex-col bg-inputBG rounded-xl p-2 gap-4'>
            <div className='flex justify-between items-start gap-4 w-full '>
                <div id='kidProfilePicContainer' className='flex flex-col w-1/4 items-center justify-start'>
                    <div id='kidProfilePic' className='relative w-16 h-16 max-h-20 rounded-full border-appBlue border-2 overflow-hidden'>
                        <Image src='/pics/generic_profile_pic.webp' alt='profile picture' className='' fill={true} style={{ objectFit: 'cover' }}></Image>
                    </div>
                    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button>
                </div>
                <div className='w-3/4 flex flex-col gap-y-1'>
                    <p className='w-full'>{`Kid's name`}</p>
                    <div className='block w-full text-xs'>
                        <input type='checkbox' id='showLastNameToggle' className='mr-2'></input><label htmlFor="showLastNameToggle">First name only</label>
                    </div>
                    <div className='block w-full text-xs'>
                        <label htmlFor="showLastNameToggle" className='mr-2'>Birthday</label><input type='date' id='showLastNameToggle' className='w-4/6 rounded'></input>
                    </div>
                </div>
            </div>
            <div className='w-full'>
                <p className='text-sm'>Parents: parent names</p>
                <p className='text-sm'>Caregivers: caregiver names</p>
                <div className='flex justify-between w-full my-4'>
                    <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Parent</button>
                    <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Caregiver</button>
                </div>
            </div>
        </div>
    )
}
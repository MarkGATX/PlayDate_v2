import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect } from "react";

export default function SingleKidCard(kidId: string) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing Supabase URL or API key");
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    <div className="singleKid flex flex-col gap-4 rounded-xl w-full bg-inputBG p-2 xl:w-3/4">
      <div className="flex w-full items-start justify-between gap-4">
        <div
          id="kidProfilePicContainer"
          className="flex w-1/4 flex-col items-center justify-start"
        >
          <div
            id="kidProfilePic"
            className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appBlue"
          >
            <Image
              src="/pics/generic_profile_pic.webp"
              alt="profile picture"
              className=""
              fill={true}
              style={{ objectFit: "cover" }}
            ></Image>
          </div>
          <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
            Edit pic
          </button>
        </div>
        <div className="flex w-3/4 flex-col gap-y-1">
          <p className="w-full">{`Kid's name`}</p>
          <div className="block w-full text-xs">
            <input
              type="checkbox"
              id="showLastNameToggle"
              className="mr-2"
            ></input>
            <label htmlFor="showLastNameToggle">First name only</label>
          </div>
          <div className="block w-full text-xs">
            <label htmlFor="showLastNameToggle" className="mr-2">
              Birthday
            </label>
            <input
              type="date"
              id="showLastNameToggle"
              className="w-4/6 rounded"
            ></input>
          </div>
        </div>
      </div>
      <div className="w-full">
        <p className="text-sm">Parents: parent names</p>
        <p className="text-sm">Caregivers: caregiver names</p>
        <div className="my-4 flex w-full justify-between">
          <button className="w-90 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-2 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
            Add New Parent
          </button>
          <button className="w-90 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-2 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
            Add New Caregiver
          </button>
        </div>
      </div>
    </div>
  );
}

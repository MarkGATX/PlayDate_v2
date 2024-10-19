import { addKidRequestNotification } from "@/utils/actions/notificationActions";
import { addKidToFriendGroup, inviteKidToPlaydate } from "@/utils/actions/playdateActions";
import supabaseClient from "@/utils/supabase/client";
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions";
import { FriendGroupType, KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

export default function KidSearchCard({
  kidData,
  searchType,
  currentUserId,
  playdateInfo,
  friendGroups
}: {
  kidData: KidsType;
  searchType: string;
  currentUserId: string;
  playdateInfo?: PlaydateType;
  friendGroups: FriendGroupType[]
}) {
  const [notificationExists, setNotificationExists] = useState<boolean>(false);

  const handleAddKidRequest = async () => {
    try {
      const addRequest = await addKidRequestNotification(
        currentUserId,
        kidData.primary_caregiver,
        kidData.id,
      );
      if (addRequest) {
        setNotificationExists(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInviteKid = async () => {
    if (!playdateInfo) {
      //no playdate Info
      console.log("no playdate info");
      return;
    }
    try {
      const kidInvite = await inviteKidToPlaydate(
        kidData.id,
        kidData.primary_caregiver,
        playdateInfo,
      );
      if (kidInvite) {
        setNotificationExists(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInviteKidWithGroup = async () => {
    if (!playdateInfo) {
      //no playdate Info
      console.log("no playdate info");
      return;
    }
    try {
      const kidInvite = await inviteKidToPlaydate(
        kidData.id,
        kidData.primary_caregiver,
        playdateInfo,
      );
      if (kidInvite) {
        setNotificationExists(true);
      }
      const addToGroup = await addKidToFriendGroup(
        friendGroups[0].id,
        kidData.id
      )
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      id="kidSearchResultCard"
      className="mx-2 mt-2 flex h-56 w-32 shrink-0 flex-col items-center justify-between rounded border-2 border-appBlue bg-appBG p-2"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          id="kidProfilePic"
          className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appBlue bg-appBG"
        >
          <Image
            src="/pics/generic_profile_pic.webp"
            alt="profile picture"
            className=""
            fill={true}
            style={{ objectFit: "cover" }}
          ></Image>
        </div>
        <h2 className="text-center text-xs">
          {kidData.first_name}{" "}
          {kidData.first_name_only ? null : kidData.last_name}
        </h2>
      </div>
      {(() => {
        switch (searchType) {
          case "addKidToParent":
            return kidData.primary_caregiver === currentUserId ? (
              <p className="w-full text-center text-xs">Primary Caregiver</p>
            ) : (
              // notificationExists ?
              //     <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Request already sent</button>
              //     :
              <button
                className="w-90 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                onClick={handleAddKidRequest}
              >
                Request add
              </button>
            );

          case "inviteToPlaydate":
            return kidData.primary_caregiver === currentUserId ? null : (
              // notificationExists ?
              //     <button className='px-2 w-90 text-xs cursor-pointer py-1 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4' >Request already sent</button>
              //     :
              <>
                <button
                  className="w-90 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleInviteKid}
                >
                  Invite
                </button>
                {friendGroups.length > 0 ?
                  <button
                    className="w-90 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={handleInviteKidWithGroup}
                  >
                    Invite & Add to Friend Group
                  </button>
                  :
                  null
                }
              </>
            );
          default:
            null;
        }
      })()}
    </div>
  );
}

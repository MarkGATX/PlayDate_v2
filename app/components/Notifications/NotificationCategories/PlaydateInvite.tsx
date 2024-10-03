import { deleteNotification } from "@/utils/actions/notificationActions";
import {
  acceptPlaydateInvite,
  fetchPlaceData,
  maybePlaydateInvite,
  rejectPlaydateInvite,
} from "@/utils/actions/playdateActions";
import supabaseClient from "@/utils/supabase/client";
import { NotificationDetailsType } from "@/utils/types/notificationTypeDefinitions";
import { placesDataType } from "@/utils/types/placeTypeDefinitions";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function PlaydateInvite({
  notification,
  index,
}: {
  notification: NotificationDetailsType;
  index: number;
}) {
  const [playdatePlaceDetails, setPlaydatePlaceDetails] =
    useState<placesDataType>();
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [playdateDay, setPlaydateDay] = useState<string>();
  const [playdateTime, setPlaydateTime] = useState<string>();

  const getPlaydatePlaceInfo = useCallback(async () => {
    let playdateDateObject = new Date(notification.playdate_time);
    setPlaydateDay(
      playdateDateObject.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ); // "YYYY-MM-DD"
    setPlaydateTime(
      playdateDateObject.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    ); // "HH:MM"

    if (!notification.playdate_location) {
      return;
    }
    const fetchPlaceDetails = await fetchPlaceData(
      notification.playdate_location,
    );
    setPlaydatePlaceDetails(fetchPlaceDetails);
  }, [notification.playdate_location, notification.playdate_time]);

  useEffect(() => {
    getPlaydatePlaceInfo();
  }, [notification, getPlaydatePlaceInfo]);

  const handleShowMoreInfo = async () => {
    setShowMoreDetails(true);
  };

  const handleAcceptPlaydateInvite = async () => {
    if (!notification.playdate_id) {
      return;
    }
    try {
      const result = await acceptPlaydateInvite(
        notification.playdate_id,
        notification.kid.id,
      );
      if (result) {
        deleteNotification(notification.id);
      } else {
        console.error("Failed to update playdate status");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleRejectPlaydateInvite = async () => {
    if (!notification.playdate_id) {
      return;
    }
    try {
      const result = await rejectPlaydateInvite(
        notification.playdate_id,
        notification.kid.id,
      );
      if (result) {
        deleteNotification(notification.id);
      } else {
        console.error("Failed to update playdate status");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleMaybePlaydateInvite = async () => {
    if (!notification.playdate_id) {
      return;
    }
    try {
      const result = await maybePlaydateInvite(
        notification.playdate_id,
        notification.kid.id,
      );
      if (result) {
        deleteNotification(notification.id);
      } else {
        console.error("Failed to update playdate status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <section
        id={`singleNotificationContainer${notification.id}${index}`}
        className="flex flex-col gap-4 rounded-lg bg-inputBG p-2"
      >
        <div className="gap-w flex w-full justify-between">
          <div
            id={`parentProfilePicContainer${notification.kid.profile_pic}${index}`}
            className="relative flex h-9 w-9 justify-center"
          >
            <Image
              src={
                notification.kid.profile_pic || "/pics/generic_profile_pic.webp"
              }
              alt="invited kid's profile pic"
              fill={true}
              className="rounded-full"
              style={{ objectFit: "cover" }}
            ></Image>
          </div>
          <div
            id={`notificationMessageContainer${notification.id}${index}`}
            className="w-2/3 text-center text-sm"
          >
            <span className="font-bold">
              {notification.sender.first_name} {notification.sender.last_name}
            </span>{" "}
            invites{" "}
            <span className="font-bold">
              {notification.kid.first_name}{" "}
              {notification.kid.first_name_only
                ? null
                : notification.kid.last_name}
            </span>{" "}
            to a playdate with{" "}
            <span className="font-bold">
              {notification.host_kid.first_name}{" "}
              {notification.host_kid.first_name_only
                ? null
                : notification.host_kid.last_name}
            </span>
          </div>
          <div
            id={`senderProfilePicContainer${notification.id}${index}`}
            className="relative flex h-9 w-9 justify-center"
          >
            <Image
              src={
                notification.host_kid.profile_pic ||
                "/pics/generic_profile_pic.webp"
              }
              alt="host kid's profile pic"
              fill={true}
              className="rounded-full"
              style={{ objectFit: "cover" }}
            ></Image>
          </div>
        </div>
        <hr className="border-1 border-appBlue" />
        <div
          id={`morePlaydateInfo${notification.id}${index}`}
          className="flex items-center justify-start gap-4 text-sm"
        >
          {playdatePlaceDetails ? (
            <>
              <div className="relative flex h-9 w-9 justify-center">
                <Image
                  src={`https://places.googleapis.com/v1/${playdatePlaceDetails.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`}
                  fill={true}
                  alt={`Image of ${playdatePlaceDetails.displayName.text}`}
                  style={{ objectFit: "cover" }}
                  className="w-20 rounded"
                />
              </div>
              <div>
                <h3>{playdatePlaceDetails.displayName.text}</h3>
                <p>
                  {playdateDay} at {playdateTime}
                </p>
              </div>
            </>
          ) : null}
        </div>
        <div
          id={`requestResponseButtons${notification.id}${index}`}
          className="flex w-full flex-wrap justify-around gap-2"
        >
          <Link
            href={`/playdates/${notification.playdate_id}`}
            className="flex w-full justify-center"
          >
            {" "}
            <button className="mt-2 w-28 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
              More Info...
            </button>
          </Link>
          <button
            className="mt-2 w-20 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleAcceptPlaydateInvite}
          >
            Yes
          </button>
          <button
            className="mt-2 w-20 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleRejectPlaydateInvite}
          >
            No
          </button>
          <button
            className="mt-2 w-20 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleMaybePlaydateInvite}
          >
            Maybe
          </button>
        </div>

        {/* {errorMessage
                    ?
                    <section id='errorMessageContainer' className='text-red-700'>
                        {errorMessage}
                    </section>
                    :
                    null
                } */}
      </section>
    </>
  );
}

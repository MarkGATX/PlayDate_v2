import {
  approveAddKidRequest,
  deleteNotification,
  denyAddKidRequest,
} from "@/utils/actions/notificationActions";
import supabaseClient from "@/utils/supabase/client";
import {
  NotificationDetailsType,
  NotificationsType,
} from "@/utils/types/notificationTypeDefinitions";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AddKidRequestNotification({
  notification,
}: {
  notification: NotificationDetailsType;
}) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [requestStatus, setRequestStatus] = useState<string>();
  const { sender, kid, notification_type, receiver } = notification;

  const handleApproveAddRequest = async () => {
    setRequestStatus("loading");
    if (!kid.id) {
      console.error("Kid ID is undefined");
      setErrorMessage(
        "There was a problem approving your request: Kid ID undefined",
      );
      setRequestStatus("error");
      return;
    }
    const newNotificationData = {
      new_parent_id: sender.id,
      sender_id: receiver.id,
      kid_id: kid.id,
    };
    try {
      await approveAddKidRequest(newNotificationData);
      await deleteNotification(notification.id);
      setRequestStatus("success");
      //reRender dash
      // reRender(previousValue => !previousValue)
    } catch (error) {
      console.error(error);
      setRequestStatus("error");
    }
  };

  const handleDenyAddRequest = async () => {
    setRequestStatus("loading");
    if (!kid.id) {
      console.error("Kid ID is undefined");
      setErrorMessage(
        "There was a problem denying your request: Kid ID undefined",
      );
      setRequestStatus("error");
      return;
    }
    //creating denial notification
    const newNotificationData = {
      sender_id: notification.receiver.id,
      receiver_id: sender.id,
      kid_id: kid.id,
    };
    try {
      await denyAddKidRequest(newNotificationData);
      await deleteNotification(notification.id);
      setRequestStatus("success");
      //reRender dash
      // reRender(previousValue => !previousValue)
    } catch (error) {
      console.error(error);
      setRequestStatus("error");
    }
  };

  return (
    <>
      <section
        id="singleNotificationContainer"
        className="flex flex-wrap justify-between gap-2 rounded-lg bg-inputBG p-2"
      >
        <div
          id="senderProfilePicContainer"
          className="relative flex h-9 w-9 justify-center"
        >
          <Image
            src={
              notification.sender.profilePicURL ||
              "/pics/generic_profile_pic.webp"
            }
            alt="sender's profile pic"
            fill={true}
            className="rounded-full"
            style={{ objectFit: "cover" }}
          ></Image>
        </div>
        <div
          id="notificationMessageContainer"
          className="w-2/3 text-center text-sm"
        >
          <span className="font-bold">
            {notification.sender.first_name} {notification.sender.last_name}
          </span>{" "}
          requests to be added as a <span className="font-bold">Parent</span> to{" "}
          <span className="font-bold">
            {notification.kid.first_name} {notification.kid.last_name}
          </span>
        </div>
        <div
          id="senderProfilePicContainer"
          className="relative flex h-9 w-9 justify-center"
        >
          <Image
            src={
              notification.kid.profile_pic || "/pics/generic_profile_pic.webp"
            }
            alt="sender's profile pic"
            fill={true}
            className="rounded-full"
            style={{ objectFit: "cover" }}
          ></Image>
        </div>
        <section
          id="requestResponseButtons"
          className="flex w-full justify-around"
        >
          <button
            className="mt-2 w-28 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleApproveAddRequest}
          >
            Approve
          </button>
          <button
            className="mt-2 w-28 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleDenyAddRequest}
          >
            Deny
          </button>
        </section>
        {errorMessage ? (
          <section id="errorMessageContainer" className="text-red-700">
            {errorMessage}
          </section>
        ) : null}
      </section>
    </>
  );
}

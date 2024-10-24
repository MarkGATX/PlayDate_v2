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
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import AddKidRequestNotification from "./NotificationCategories/AddKidRequestNotification";
import ApprovedAddKidRequestNotification from "./NotificationCategories/ApprovedAddKidRequest";
import { NotificationEnums } from "@/utils/enums/notificationEnums";
import PlaydateInvite from "./NotificationCategories/PlaydateInvite";
import NotificationSuspense from "./NotificationSuspense";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ChangePlaydateTime from "./NotificationCategories/ChangePlaydateTime";

export default function Notification({
  currentUser,
}: {
  currentUser: AdultsType;
}) {
  const [notifications, setNotifications] = useState<NotificationDetailsType[]>(
    [],
  );
  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const notificationsAreaRef = useRef<HTMLDivElement | null>(null);
  const { contextSafe } = useGSAP();

  useEffect(() => {
    const getCurrentNotifications = async () => {
      try {
        const { data: notificationData, error: notificationError } =
          await supabaseClient
            .from("Notifications")
            .select("*")
            .eq("receiver_id", currentUser.id);
        if (notificationData && notificationData.length > 0) {
          const updatedNotifications = await Promise.all(
            notificationData.map(async (notification) => {
              const { data: senderData, error: senderDataError } =
                await supabaseClient
                  .from("Adults")
                  .select("id, first_name, last_name, profilePicURL")
                  .eq("id", notification.sender_id)
                  .single();
              if (senderDataError) {
                throw senderDataError;
              }
              let kidData;
              if (notification.kid_id) {
                const { data: kidRawData, error: kidRawDataError } =
                  await supabaseClient
                    .from("Kids")
                    .select(
                      "id, first_name, last_name, profile_pic, primary_caregiver, first_name_only",
                    )
                    .eq("id", notification.kid_id)
                    .single();
                if (kidRawDataError) {
                  throw kidRawDataError;
                }
                kidData = kidRawData;
              }

              let playdateData;
              if (
                notification.notification_type ===
                  NotificationEnums.inviteToPlaydate ||
                NotificationEnums.changePlaydateTime
              ) {
                //get additional playdate information if related to playdates.
                const {
                  data: playdateDetailsData,
                  error: playdateDetailsDataError,
                } = await supabaseClient
                  .from("Playdates")
                  .select(
                    "location, time, Kids(id, first_name, last_name, first_name_only, profile_pic)",
                  )
                  .eq("id", notification.playdate_id)
                  .single();
                playdateData = playdateDetailsData;

                if (playdateDetailsDataError) {
                  throw playdateDetailsDataError;
                }
              }

              return {
                ...notification,
                sender: senderData,
                kid: kidData,
                receiver: currentUser,
                playdate_location: playdateData?.location,
                playdate_time: playdateData?.time,
                host_kid: playdateData?.Kids,
              }; // Combine data into a single object
            }),
          );

          setNotifications(updatedNotifications);
          // setNotifications(prevNotifications => {
          //   console.log('Previous notifications:', prevNotifications);
          //   console.log('New notifications:', updatedNotifications);
          //   return updatedNotifications;
          // });
        } else {
          setNotifications([]); // Handle case where no notifications are found
        }
        setIsLoadingNotifications(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const notificationSubscription = supabaseClient
      .channel("dashboard_realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Notifications",
          filter: `receiver_id=eq.${currentUser?.id}`,
        },
        (payload) => {
          console.log('notification sub', payload)
          //refetch notifications
          getCurrentNotifications();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Notification Subscription successful');
        } else {
          console.error('Notification Subscription failed:', status);
        }
      });

    getCurrentNotifications();

    return () => {
      supabaseClient.removeChannel(notificationSubscription);
    };
  }, [currentUser]);

  const handleShowNotifications = async () => {
    if (notificationsAreaRef.current) {
      if (!showNotifications) {
        gsap.to(notificationsAreaRef.current, {
          height: "auto",
          autoAlpha: 1,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowNotifications((previousValue) => !previousValue);
      } else {
        gsap.to(notificationsAreaRef.current, {
          height: 0,
          autoAlpha: 0,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowNotifications((previousValue) => !previousValue);
      }
    }
  };
  console.log(notifications)

  return (
    <section
      id="notificationSection"
      className="mb-4 flex w-full flex-col gap-2"
    >
      <div className="align-center flex w-full items-center justify-start bg-appBlue px-4 text-appBG xl:rounded-bl-md">
        <div
          className="transform cursor-pointer rounded-md bg-appGold p-2 duration-300 ease-in-out hover:scale-125"
          onClick={handleShowNotifications}
        >
          <Image
            src={`/icons/down_arrow.webp`}
            width={15}
            height={16}
            alt="down icon to show more details"
            title="more details"
            className={`transform duration-700 ease-in-out ${showNotifications ? "-rotate-180" : "rotate-0"} `}
          ></Image>
        </div>
        <h2 className="p-4 text-left font-bold">Notifications </h2>
        {notifications.length > 0 ? (
          <p className="relative min-w-4 rounded-full bg-inputBG text-center text-sm text-appBlue">
            {notifications.length}
          </p>
        ) : null}
      </div>
      <div
        ref={notificationsAreaRef}
        className="flex h-0 flex-col gap-2 overflow-y-hidden px-4 opacity-0"
      >
        {isLoadingNotifications ? (
          <div>Loading notifications...</div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification, index) => {
            switch (notification.notification_type) {
              case NotificationEnums.addKidRequest:
                if (notification.kid.primary_caregiver === currentUser.id) {
                  return (
                    <AddKidRequestNotification
                      notification={notification}
                      key={notification.id}
                    />
                  );
                }
                break;
              case NotificationEnums.approveKidRequest:
                if (currentUser.id) {
                  return (
                    <ApprovedAddKidRequestNotification
                      notification={notification}
                      key={notification.id}
                    />
                  );
                }
                break;
              case NotificationEnums.inviteToPlaydate:
                if (currentUser.id) {
                  return (
                    <Suspense key={index} fallback={<NotificationSuspense />}>
                      <PlaydateInvite
                        index={index}
                        key={notification.id}
                        notification={notification}
                      />
                    </Suspense>
                  );
                }
                break;
              case NotificationEnums.changePlaydateTime:
                if (currentUser.id) {
                  return (
                    <Suspense key={index} fallback={<NotificationSuspense />}>
                      <ChangePlaydateTime
                        index={index}
                        key={notification.id}
                        notification={notification}
                      />
                    </Suspense>
                  );
                }
                break;
              default:
                return null;
            }
          })
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </section>
  );
}

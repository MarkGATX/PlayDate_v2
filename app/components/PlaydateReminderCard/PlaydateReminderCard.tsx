import { PlaydateDashboardListType } from "@/utils/types/playdateTypeDefinitions";
import {
  acceptPlaydateInvite,
  deletePlaydate,
  maybePlaydateInvite,
  rejectPlaydateInvite,
} from "@/utils/actions/playdateActions";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// momoizing component to attempt to reduce re-renders and visual jumps
// export default function PlaydateReminderCard({ playdate, index }: { playdate: PlaydateDashboardListType, index: number }) {
function PlaydateReminderCard({
  playdate,
  index,
}: {
  playdate: PlaydateDashboardListType;
  index: number;
}) {
  const [showStatusChange, setShowStatusChange] = useState<boolean>(false);
  const playdateChangeStatusRef = useRef<HTMLDivElement | null>(null);

  const { contextSafe } = useGSAP();

  const handleShowplaydates = contextSafe(() => {
    if (playdateChangeStatusRef.current) {
      // const changeButtonsHeight = playdateChangeStatusRef.current.offsetHeight
      if (!showStatusChange) {
        gsap.to(playdateChangeStatusRef.current, {
          height: "auto",
          autoAlpha: 1,
          ease: "power2.inOut",
          duration: 0.5,
        });
        setShowStatusChange((previousValue) => !previousValue);
      } else {
        gsap.to(playdateChangeStatusRef.current, {
          height: 0,
          autoAlpha: 0,
          ease: "power2.inOut",
          duration: 0.5,
        });
        setShowStatusChange((previousValue) => !previousValue);
      }
    }
  });

  const handleChangeToAccept = async () => {
    try {
      const change = await acceptPlaydateInvite(
        playdate.playdate_id,
        playdate.kid_id,
      );
      handleShowplaydates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeToReject = async () => {
    try {
      const change = await rejectPlaydateInvite(
        playdate.playdate_id,
        playdate.kid_id,
      );
      handleShowplaydates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeToMaybe = async () => {
    try {
      const change = await maybePlaydateInvite(
        playdate.playdate_id,
        playdate.kid_id,
      );
      handleShowplaydates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePlaydate = async () => {
    deletePlaydate(playdate.playdate_id);
    handleShowplaydates();
  };

  const renderPlaydateStatusAlert = (playdate: PlaydateDashboardListType) => {
    if (playdate.Playdates.host_kid_id === playdate.kid_id) {
      return (
        <div
          className="absolute -left-2 -top-2 z-10 -rotate-12 rounded-lg border-2 border-purple-500 bg-appGold p-1 text-2xl font-bold text-purple-500 opacity-75"
          style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}
        >
          HOST!
        </div>
      );
    }
    switch (playdate.invite_status) {
      case "accepted":
        return (
          <div
            className="absolute -left-2 -top-2 -rotate-12 rounded-lg border-2 border-green-500 bg-appGold p-1 text-2xl font-bold text-green-500 opacity-75"
            style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}
          >
            Going
          </div>
        );
      case "rejected":
        return (
          <div
            className="absolute -left-2 -top-2 -rotate-12 rounded-lg border-2 border-red-500 bg-appGold p-1 text-2xl font-bold text-red-500 opacity-75"
            style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}
          >
            Not Going
          </div>
        );
      case "maybe":
        return (
          <div
            className="absolute -left-2 -top-2 -rotate-12 rounded-lg border-2 border-yellow-600 bg-appGold p-1 text-2xl font-bold text-yellow-600 opacity-75"
            style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}
          >
            Maybe??
          </div>
        );
      case "invited":
        return (
          <div
            className="absolute -left-2 -top-2 -rotate-12 rounded-lg border-2 border-green-500 bg-appGold p-1 text-2xl font-bold text-green-500 opacity-75"
            style={{ boxShadow: `2px 2px 4px var(--appBlue)` }}
          >{`Haven't Decided`}</div>
        );
    }
  };

  let playdateDateObject = new Date(playdate.Playdates.time);

  return playdate.invite_status === "invited" ? null : (
    <div
      key={`playdateReminderDetail${playdate.playdate_id}${index}`}
      className="relative mt-4 flex w-full flex-wrap items-center justify-start gap-2 rounded-lg bg-inputBG p-4 xl:w-3/4"
    >
      <div
        id={`kidPlaydateReminderDetails${playdate.Kids.id}${index}`}
        className="flex w-full items-center gap-2"
      >
        <div className="relative flex w-1/5 justify-center rounded-full">
          <Image
            src={playdate.Kids.profile_pic || "/pics/generic_profile_pic.webp"}
            alt="invited kid's profile pic"
            width={48}
            height={48}
            className="rounded-full"
            style={{ objectFit: "cover" }}
          ></Image>
        </div>
        <p className="w-4/5">
          <span className="font-bold">{playdate.Kids.first_name}</span> has a
          playdate on{" "}
          <span className="font-bold">
            {playdateDateObject.toLocaleString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </span>{" "}
          at{" "}
          <span className="font-bold">
            {playdateDateObject.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </p>
      </div>
      <div
        id={`kidPlaydateReminderButtons${playdate.Kids.id}${index}`}
        className="flex w-full items-center justify-start gap-2"
      >
        <Link href={`/playdates/${playdate.playdate_id}`} className="">
          <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
            More info...
          </button>
        </Link>
        <Link href="" className="">
          <button
            className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={handleShowplaydates}
          >
            Change Status
          </button>
        </Link>
      </div>
      <div
        id={`kidPlaydateChangeStatusButtons${playdate.Kids.id}${index}`}
        ref={playdateChangeStatusRef}
        className={`changeButtonContainer flex h-0 w-full items-center justify-start gap-2 opacity-0`}
      >
        {playdate.Playdates.host_kid_id === playdate.kid_id ? (
          <button
            className="w-90 mt-2 transform cursor-pointer rounded-lg border-white bg-red-500 px-1 py-1 text-xs text-white duration-300 ease-in-out hover:border-red-500 hover:bg-blueGradient hover:bg-appBlue hover:text-red-500 active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={() => handleDeletePlaydate()}
          >
            Cancel Playdate
          </button>
        ) : (
          <>
            <button
              className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleChangeToAccept()}
            >
              Accept
            </button>
            <button
              className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleChangeToReject()}
            >
              Reject
            </button>
            <button
              className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleChangeToMaybe()}
            >
              Maybe
            </button>
          </>
        )}
      </div>

      {renderPlaydateStatusAlert(playdate)}
    </div>
  );
}
export default memo(PlaydateReminderCard);

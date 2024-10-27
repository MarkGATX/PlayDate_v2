"use client";

import KidSearchResults from "@/app/components/KidSearchResults/KidSearchResults";
import KidSearchResultsSuspense from "@/app/components/KidSearchResults/KidSearchResultsSuspense";
import PlaydateAttendanceTabs from "@/app/components/PlaydateAttendanceTabs/PlaydateAttendanceTabs";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "@/utils/SwiperCustom/swiperCustom.scss";
import PlaydateAttendanceTabsSuspense from "@/app/components/PlaydateAttendanceTabs/PlaydateAttendanceTabsSuspense";
import {
  deletePlaydate,
  fetchPlaceData,
  inviteFriendGroup,
} from "@/utils/actions/playdateActions";
import { AuthContext } from "@/utils/firebase/AuthContext";
import supabaseClient from "@/utils/supabase/client";
import {
  placesDataType,
  placesDataTypeWithExpiry,
} from "@/utils/types/placeTypeDefinitions";
import { PlaydateType } from "@/utils/types/playdateTypeDefinitions";
import { AdultsType, FriendGroupMembersType, FriendGroupType, SupabaseFriendGroupMemberType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { sendPlaydateUpdates } from "@/utils/actions/notificationActions";
const QuillEditor = dynamic(
  () => import("@/app/components/QuillEditor/QuillEditor"),
  { ssr: false },
);
import Quill, { Delta } from "quill/core";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import { fetchPlaceDetails } from "@/utils/map/placeDetailsAPI";

export default function PlaydateDetails() {
  const params = useParams<{ playdateID: string }>();
  const [playdateInfo, setPlaydateInfo] = useState<PlaydateType>();
  const [placeDetails, setPlaceDetails] = useState<placesDataType>();
  const [kidSearchTerm, setKidSearchTerm] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<AdultsType>();
  const [openEditDate, setOpenEditDate] = useState<boolean>(false);
  const [unformattedPlaydateDate, setUnformattedPlaydateDate] =
    useState<DateTime>();
  const [newPlaydateDate, setNewPlaydateDate] = useState<string>();
  const newDateInputRef = useRef<HTMLInputElement | null>(null);
  const [editDateError, setEditDateError] = useState<string>();
  const [openNoteEditor, setOpenNoteEditor] = useState<boolean>(false);
  const [openDeletePlaydateModal, setOpenDeletePlaydateModal] =
    useState<boolean>(false);
  const [friendGroups, setFriendGroups] = useState<FriendGroupType[]>([])

  const { user } = useContext(AuthContext);
  const playdateID: string = params.playdateID;
  const router = useRouter();



  useEffect(() => {
    const getPlaydateInfo = async () => {
      try {
        const { data: playdateData, error: playdateDataError } =
          await supabaseClient
            .from("Playdates")
            .select(
              "*, Kids(first_name, last_name, first_name_only), Adults(first_name, last_name)",
            )
            .eq("id", params.playdateID);
        if (playdateDataError) {
          throw playdateDataError;
        }
        console.log(playdateData);
        if (playdateData.length === 0) {

          // notFound();
          router.push("/playdates/");
        } else if (playdateData.length > 0) {

          let luxonDate = DateTime.fromISO(playdateData[0].time);

          setUnformattedPlaydateDate(luxonDate);

          // extract the Adults and Kids keys from the response to make the state object easier to read and navigate for clarity. Adults and Kids seems confusing since there will be only one host and one kid per playdate
          const { Adults, Kids, ...remainingData } = playdateData[0];
          const newPlaydateData = {
            ...remainingData,
            kid_name: {
              first_name: Kids.first_name,
              last_name: Kids.last_name,
            },
            host_name: {
              first_name: Adults.first_name,
              last_name: Adults.last_name,
            },
            kid_first_name_only: Kids.first_name_only,
          };
          setPlaydateInfo(newPlaydateData);

          //get kid friend groups
          const { data: friendGroupData, error: friendGroupError } = await supabaseClient
            .from("Friend_Group")
            .select("*")
            .eq("kid_owner", newPlaydateData.host_kid_id)
          if (friendGroupError) {
            throw friendGroupError
          }

          console.log(friendGroupData)

          // Use a temporary array to collect friend groups
          const tempFriendGroups = [];

          // Clear previous friend groups before setting new ones
          setFriendGroups([]);
          //use for...of to handle await in each fetch from supabase
          //use returns to ensure correct typing of response. once again supabase expecting an array but returning an object. this return overrides that
          for (const friendGroup of friendGroupData) {
            const { data: friendGroupMembers, error: friendGroupMembersError } = await supabaseClient
              .from("Friend_Group_Members")
              .select("kid_uid, Kids(primary_caregiver, first_name, first_name_only, last_name, profile_pic)")
              .eq("friend_group_uid", friendGroup.id)
              .returns<SupabaseFriendGroupMemberType[]>();
            if (friendGroupMembersError) {
              throw friendGroupMembersError
            }
            console.log(friendGroupMembers)
            const friendGroupData = {
              id: friendGroup.id,
              group_name: friendGroup.group_name,
              kid_owner: friendGroup.kid_owner,
              //map group members to extract from uid and use a string
              friend_group_members: friendGroupMembers.map((member: SupabaseFriendGroupMemberType) =>
              ({
                kid_id: member.kid_uid,
                primary_caregiver_id: member.Kids.primary_caregiver || '',
                profile_pic: member.Kids.profile_pic || '',
                first_name: member.Kids.first_name,
                last_name: member.Kids.last_name,
                first_name_only: member.Kids.first_name_only
              }))
            }
            console.log(friendGroupData)
            console.log(friendGroupMembers)
            tempFriendGroups.push(friendGroupData)

          }
          setFriendGroups(tempFriendGroups)

          //get location data
          // check for location in local storage first
          const localStoragePlaces = localStorage.getItem("placesData");
          const placesData: placesDataTypeWithExpiry = localStoragePlaces
            ? JSON.parse(localStoragePlaces)
            : [];
          //if places has any data, check to see if stored locally otherwise fetch
          if (placesData?.places?.length > 0) {
            const selectedPlace = placesData.places.find(
              (place: placesDataType) => place.id === playdateData[0].location,
            );
            //if place is in local storage, set details, else fetch details
            if (selectedPlace) {
              setPlaceDetails(selectedPlace);
            } else {
              const fetchPlace = await fetchPlaceDetails(
                playdateData[0].location,
              );
              setPlaceDetails(fetchPlace);
            }
          } else if (
            placesData?.places?.length === 0 ||
            !placesData?.places?.length
          ) {
            const fetchPlaceDetails = await fetchPlaceData(
              playdateData[0].location,
            );
            setPlaceDetails(fetchPlaceDetails);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const playdateSubscription = supabaseClient
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Playdates",
          filter: `id=eq.${params.playdateID}`,
        },
        (payload) => {
          getPlaydateInfo();
        },
      )
      .subscribe();

    getPlaydateInfo();

    return () => {
      supabaseClient.removeChannel(playdateSubscription);
    };
  }, [params, router]);

  useEffect(() => {
    const getCurrentUser = async () => {
      // getCachedUser()
      try {
        const firebase_uid = user?.uid;
        if (!firebase_uid) {
          return;
        }
        const { data: adultData, error: adultError } = await supabaseClient
          .from("Adults")
          .select("*")
          .eq("firebase_uid", firebase_uid);
        if (adultError) {
          throw adultError;
        }
        if (adultData) {
          setCurrentUser(adultData[0]);

          const { data: notificationData, error: notificationError } =
            await supabaseClient
              .from("Notifications")
              .select("*")
              .eq("receiver_id", adultData[0].id);
          setCurrentUser({
            ...adultData[0],
            Notifications: notificationData,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    getCurrentUser();
  }, [user]);

  const handleNewDateChange = async () => {
    if (!newDateInputRef.current) {
      return;
    }
    setNewPlaydateDate(newDateInputRef.current.value);
  };

  const handleUpdateDateAndTime = async () => {
    if (!newDateInputRef.current) {
      return;
    }
    try {
      const newDateTime = newDateInputRef.current.value;
      const inputDate = DateTime.fromISO(newDateTime);
      const currentDate = DateTime.now();

      if (inputDate < currentDate) {
        //date is before current date
        setEditDateError("Playdates can not be in the past");
        return;
      } else {
        const { data: updatedDateData, error: updatedDateDataError } =
          await supabaseClient
            .from("Playdates")
            .update({ time: inputDate })
            .eq("id", playdateID)
            .select();
        if (updatedDateDataError) {
          throw updatedDateDataError;
        }
        // Ensure playdateInfo and host_id are defined before calling sendPlaydateUpdates
        if (playdateInfo && playdateInfo.host_id) {
          // Send update notification to all parents associated with kids
          sendPlaydateUpdates(playdateID, playdateInfo.host_id);
        } else {
          console.error("playdateInfo or host_id is undefined");
        }
        //set date to display as new date
        setUnformattedPlaydateDate(DateTime.fromISO(updatedDateData[0].time));
        //close date edit elements
        setOpenEditDate((previousValue) => !previousValue);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePlaydate = async () => {
    try {
      await deletePlaydate(playdateID);
      router.push('/dashboard')
    } catch (error) {
      console.error("Error deleting playdate: ", error);
    }
  };

  const handleInviteFriendGroup = async () => {
    if (friendGroups.length === 0 || !playdateInfo) {
      return
    }
    try {
      await inviteFriendGroup(friendGroups[0], playdateInfo)
    } catch (error) {
      console.error('There was an error inviting the friend group', error)
    }
  }

  console.log(placeDetails)

  return (
    <main className='xl:flex w-full'>
      <div className='xl:flex xl:flex-col w-full xl:w-2/3 xl:order-2'>
        <div id="playdateLocationImageContainer" className="flex h-[250px] sm:h-[33dvh] xl:h-[calc(100dvh-125px)] w-full "
        >
          <Swiper
            pagination={true}
            effect={"fade"}
            navigation={true}
            modules={[Pagination, Navigation, EffectFade]}
          >
            {placeDetails ? (
              !placeDetails.photos || placeDetails.photos.length === 0 ? (
                // use override class to force swiper to not define inline style of 150px width
                <SwiperSlide className="swiper-slide-override">
                  <Image
                    src="/logos/playdate_logo.webp"
                    alt="Playdate logo"
                    // width={250}
                    // height={250}
                    fill={true}
                    sizes="(max-width:768px) 100vw, 33vw"
                    style={{ objectFit: "contain" }}
                  />
                </SwiperSlide>
              ) : (
                placeDetails.photos?.map((photo, index) => (
                  <SwiperSlide key={`${placeDetails?.id}photo${index}`}>
                    <Image
                      src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`}
                      alt={`pic ${index + 1} of ${placeDetails?.displayName.text}`}
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                    {photo.authorAttributions[0].displayName ? (
                      <a
                        href={`${photo.authorAttributions[0].uri}`}
                        target="_blank"
                      >
                        <p className="absolute z-10 bg-blueGradient bg-appBlueTrans p-2 text-xs text-appGold">
                          Image by {photo.authorAttributions[0].displayName}
                        </p>
                      </a>
                    ) : null}
                  </SwiperSlide>
                ))
              )
            ) : (
              <p> Loading Images...</p>
            )}
          </Swiper>
          {/* <Image
            src={`https://places.googleapis.com/v1/${placeDetails?.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=800&maxHeightPx=800`}
            alt={`pic of ${placeDetails?.displayName.text}`}
            fill={true}
            style={{ objectFit: "cover" }}
          ></Image>
          {placeDetails?.photos[0].authorAttributions[0].displayName ? (
            <a
              href={`${placeDetails.photos[0].authorAttributions[0].uri}`}
              target="_blank"
            >
              <p className="absolute z-10 bg-blueGradient bg-appBlueTrans p-1 text-xs text-appGold">
                Image by{" "}
                {placeDetails.photos[0].authorAttributions[0].displayName}
              </p>
            </a>
          ) : null} */}
        </div>
      </div>
      <div className="xl:flex xl:flex-col xl:w-1/3">
        {playdateInfo && placeDetails ? (
          <>
            <div id="playdateHeader" className="flex w-full flex-col items-center justify-center gap-0 bg-blueGradient bg-appBlue p-4 text-appBG">
              <h1 className="text-xl font-bold">{`Playdate at`}</h1>{" "}
              <Link
                href={`/place/${placeDetails.id}`}
                className="w-full text-center underline"
              >
                <h1>{`${placeDetails.displayName.text}`}</h1>
              </Link>
              <h1>
                {`with ${playdateInfo.kid_name.first_name}`}{" "}
                {playdateInfo.kid_first_name_only
                  ? null
                  : `${playdateInfo.kid_name.last_name}`}{" "}
              </h1>
            </div>
            <section
              id="playdateLocationInfo"
              className="flex w-full flex-col items-center"
            >
              {openEditDate ? (
                // <h2 className='text-lg font-bold w-full text-center px-4'>edit</h2>
                <div
                  id="updatePlaydateTimesContainer"
                  className="mt-2 flex w-full flex-wrap justify-around px-4"
                >
                  <input
                    ref={newDateInputRef}
                    type="datetime-local"
                    min={Date.now()}
                    value={
                      newPlaydateDate ||
                      unformattedPlaydateDate?.toFormat("yyyy-MM-dd'T'HH:mm")
                    }
                    className={`w-full ${editDateError ? "text-red-600" : "text-inherit"}`}
                    onChange={handleNewDateChange}
                  ></input>
                  {editDateError ? (
                    <div className="text-red-600">{editDateError}</div>
                  ) : null}
                  <button
                    className="w-90 my-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => {
                      handleUpdateDateAndTime();
                    }}
                  >
                    Save New Time
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="w-full px-4 text-center text-lg font-bold">
                    <time dateTime={unformattedPlaydateDate?.toLocaleString()}>
                      {unformattedPlaydateDate?.toLocaleString(
                        DateTime.DATETIME_MED,
                      )}
                    </time>
                  </h2>
                </>
              )}
              {/* {openNoteEditor
                            ? */}

              <QuillEditor
                content={playdateInfo.host_notes}
                playdateID={playdateInfo.id}
                setOpenNoteEditor={setOpenNoteEditor}
                openNoteEditor={openNoteEditor}
              />

              {/* :
                            playdateInfo.host_notes
                                ?                               
                                <div> */}
              {/* {convertDeltaToHTML(playdateInfo.host_notes)} */}
              {/* </div>
                                :
                                null
                        } */}
              {playdateInfo && placeDetails && currentUser?.id === playdateInfo.host_id ? (
                <>
                  <div
                    id="editButtonContainer"
                    className="flex w-5/6 flex-wrap justify-between"
                  >
                    {playdateInfo.host_notes ? (
                      <button
                        className="w-90 my-2 min-w-28 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                        onClick={() =>
                          setOpenNoteEditor((previousValue) => !previousValue)
                        }
                      >
                        {openNoteEditor ? "Cancel Note Edits" : "Edit Note"}
                      </button>
                    ) : (
                      <button
                        className="w-90 my-2 min-w-28 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                        onClick={() =>
                          setOpenNoteEditor((previousValue) => !previousValue)
                        }
                      >
                        {openNoteEditor ? "Cancel Note Edits" : "Add a Note"}
                      </button>
                    )}
                    <button
                      className="w-90 my-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                      onClick={() =>
                        setOpenEditDate((previousValue) => !previousValue)
                      }
                    >
                      {openEditDate
                        ? "Cancel Edit date and time"
                        : "Edit Date and Time"}
                    </button>
                    <button
                      className="my-2 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-red-700 hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => setOpenDeletePlaydateModal(true)}
                    >
                      Cancel playdate
                    </button>
                  </div>
                </>
              ) : null}
              <p className="w-full px-4 text-center">
                <a href=""></a>
                {placeDetails.formattedAddress}
              </p>
              {/* This url only opens a map without directions. The live anchor opens a map with directions but based solely on lat and long, which may show a different location name */}
              {/* <a href={`https://www.google.com/maps/place/?q=place_id:${placeDetails.id}&travel_mode`} target="_blank"> */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=my+location&destination=${placeDetails.location.latitude},${placeDetails.location.longitude}&travelmode=driving`}
                target="_blank"
              >
                <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
                  Get Directions
                </button>
              </a>
            </section>
          </>
        ) : (
          <div>
            <div
              id="playdateHeader"
              className="flex w-full flex-col items-center justify-center gap-0 bg-blueGradient bg-appBlue p-4 text-appBG"
            >
              <h1 className="text-xl font-bold">Loading your playdate</h1>
              <h1>Sit tight...</h1>
            </div>
            <section
              id="playdateLocationInfo"
              className="flex w-full flex-col items-center"
            >
              <div
                id="playdateLocationImageContainer"
                className="relative h-72 w-full"
              ></div>
            </section>
            <h2 className="w-full px-4 text-center text-lg font-bold"></h2>
            <p className="w-full px-4 text-center">
              <a href=""></a>
            </p>
            <div className="flex w-full justify-center p-4">
              <h1 className="">Loading your location details...</h1>
            </div>
          </div>
        )}
        {!playdateID ? null : (
          <Suspense fallback={<p>Loading attendance...</p>}>
            {/* <Suspense fallback={<PlaydateAttendanceTabsSuspense />} ></Suspense> */}
            <PlaydateAttendanceTabs playdate={playdateID} />
          </Suspense>
        )}

        {playdateInfo &&
          placeDetails &&
          currentUser?.id === playdateInfo.host_id ? (
          <section id="inviteKidsSection" className="p-4 flex flex-col">
            <h3 className="font-bold w-full">Search for kids to invite...</h3>
            <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50" onClick={handleInviteFriendGroup}>{`Invite ${playdateInfo.kid_name.first_name}${playdateInfo.kid_name.first_name.slice(-1) === 's' ? "'" : "'s"} Friend Group`}</button>
            <input
              type="text"
              value={kidSearchTerm}
              placeholder={`Kid's name`}
              className="rounded-lg border-2 bg-inputBG px-2 mt-4"
              onChange={(event) => {
                setKidSearchTerm(event.target.value);
              }}
            ></input>
            <Suspense fallback={<KidSearchResultsSuspense />}>
              <KidSearchResults
                searchType="inviteToPlaydate"
                currentUser={currentUser}
                searchTerm={kidSearchTerm}
                playdateInfo={playdateInfo}
                friendGroups={friendGroups}
              />
            </Suspense>
          </section>
        ) : null}
      </div>
      {openDeletePlaydateModal ? (
        <dialog className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur">
          <div className="m-auto w-3/4 rounded-xl bg-appGold p-4">
            <div className="flex flex-col items-center">
              <p className="mb-4 block text-center">
                This will PREMANENTLY DELETE this playdate.{" "}
              </p>

              <p className="mb-4 block text-center">
                Do you want to PERMANENTLY DELETE this playdate?
              </p>
              <br />
              <button
                type="button"
                className="mb-4 mr-2 mt-2 w-full transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs font-bold text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                onClick={handleDeletePlaydate}
              >
                DELETE{" "}
              </button>
              <button
                type="button"
                className="mt-2 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setOpenDeletePlaydateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </main>
  );
}

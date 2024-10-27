import { FriendGroupMembersType, FriendGroupType, KidsType, SupabaseFriendGroupMemberType } from "@/utils/types/userTypeDefinitions";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DeleteKid,
  EditKid,
  removeAdultKidRelationship,
} from "@/utils/actions/actions";
import { useFormStatus } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import supabaseClient from "@/utils/supabase/client";
import { removeKidFromFriendGroup } from "@/utils/actions/playdateActions";
import { RealtimeChannel } from "@supabase/supabase-js";
import DashboardFriendGroupSection from "../DashboardFriendGroupSection/DashboardFriendGroupSection";

export default function KidsCard({
  kid,
  currentUser,
}: {
  kid: KidsType;
  currentUser: string;
}) {
  const [editKidInfo, setEditKidInfo] = useState<boolean>(false);
  const [kidFirstName, setKidFirstName] = useState<string>(kid.first_name);
  const [kidLastName, setKidLastName] = useState<string>(kid.last_name);
  const [kidBirthday, setKidBirthday] = useState<string | undefined>(
    kid.birthday,
  );
  const [kidFirstNameOnly, setKidFirstNameOnly] = useState<boolean>(
    kid.first_name_only,
  );
  const [kidFirstNameBlank, setKidFirstNameBlank] = useState<boolean>(false);
  const [kidLastNameBlank, setKidLastNameBlank] = useState<boolean>(false);
  const [kidTooOld, setKidTooOld] = useState<boolean>(false);
  const [kidAge, setKidAge] = useState<number | undefined>(undefined);
  const [kidProfilePic, setKidProfilePic] = useState<string | undefined>(
    kid.profile_pic,
  );
  const [friendGroups, setFriendGroups] = useState<FriendGroupType[]>([])
  const [openRemoveKidModal, setOpenRemoveKidModal] = useState<boolean>(false);
  const [openDeleteKidModal, setOpenDeleteKidModal] = useState<boolean>(false);
  const { pending } = useFormStatus();
  const firstNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
  const lastNameErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
  const birthdayErrorMessageRef = useRef<HTMLParagraphElement | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const readOnlyKidContentRef = useRef<HTMLDivElement | null>(null);
  const removeKidModalRef = useRef<HTMLDialogElement | null>(null);
  const deleteKidModalRef = useRef<HTMLDialogElement | null>(null);
  const friendGroupRef = useRef<HTMLDivElement | null>(null)
  const [showFriendGroup, setShowFriendGroup] = useState(false)

  //use js bind method to include kid id in submitted form with form action
  // const editKidWithId = EditKid.bind(null,kid.id )

  const handleEditKid = async () => {
    setEditKidInfo((previousValue) => !previousValue);
  };

  //calculate current age
  const findKidAge = useMemo(() => {
    if (kidBirthday) {
      const parsedKidBirthday = new Date(kidBirthday);
      const today = new Date();
      const kidAgeMS = today.getTime() - parsedKidBirthday.getTime();
      const kidAgeYears = kidAgeMS / (1000 * 60 * 60 * 24 * 365.25);
      // round age down
      setKidAge(Math.floor(kidAgeYears));
    }
  }, [kidBirthday]);

  const saveKidEdits = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const minDate = new Date(2000, 0, 1);
    const editedKidData: KidsType = {
      id: kid.id,
      first_name: kidFirstName.trim(),
      last_name: kidLastName.trim(),
      birthday: kidBirthday,
      first_name_only: kidFirstNameOnly,
      primary_caregiver: kid.primary_caregiver,
      profile_pic: kidProfilePic,
    };

    if (kidBirthday) {
      const parsedKidEditedBirthday = new Date(kidBirthday);
      const today = new Date();
      const editedKidAgeMS =
        today.getTime() - parsedKidEditedBirthday.getTime();
      const editedKidAgeYears = editedKidAgeMS / (1000 * 60 * 60 * 24 * 365.25);
      if (editedKidAgeYears >= 19) {
        setKidTooOld(true);

        if (birthdayErrorMessageRef.current) {
          // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
          birthdayErrorMessageRef.current.innerText =
            "Kids must be 18 or younger";
          gsap.to(birthdayErrorMessageRef.current, {
            autoAlpha: 1,
            maxHeight: "200px",
            duration: 2,
            ease: "power1.out",
            // textContent: 'Kids must be 18 or younger'
          });
        }
        return; //exit process
      } else {
        setKidTooOld(false);
        if (birthdayErrorMessageRef.current) {
          // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
          birthdayErrorMessageRef.current.innerText = "";
          gsap.to(birthdayErrorMessageRef.current, {
            autoAlpha: 0,
            maxHeight: 0,
            duration: 2,
            ease: "power1.out",
            // textContent: ``
          });
        }
      }
    }

    if (!editedKidData.first_name || editedKidData.first_name === "") {
      setKidFirstNameBlank(true);
      if (firstNameErrorMessageRef.current) {
        //may need to add to useGSAP to make sure cleanup happens. use context safe. to add to useGSAP hook https://gsap.com/resources/React/
        gsap.to(firstNameErrorMessageRef.current, {
          autoAlpha: 1,
          maxHeight: "200px",
          duration: 2,
          ease: "power1.out",
          textContent: `First name can't be blank`,
        });
      }
      return; //exit process
    } else if (editedKidData.first_name) {
      setKidFirstNameBlank(false);
      if (firstNameErrorMessageRef.current) {
        gsap.to(firstNameErrorMessageRef.current, {
          autoAlpha: 0,
          maxHeight: 0,
          duration: 0.7,
          ease: "power1.out",
          textContent: ``,
        });
      }
    }
    if (!editedKidData.last_name || editedKidData.last_name === "") {
      setKidLastNameBlank(true);
      if (lastNameErrorMessageRef.current) {
        gsap.to(lastNameErrorMessageRef.current, {
          autoAlpha: 1,
          maxHeight: "200px",
          duration: 2,
          ease: "power1.out",
          textContent: `Last name can't be blank`,
        });
      }
      return; //exit process
    } else if (editedKidData.last_name) {
      setKidLastNameBlank(false);
      if (lastNameErrorMessageRef.current) {
        gsap.to(lastNameErrorMessageRef.current, {
          autoAlpha: 0,
          maxHeight: 0,
          duration: 0.7,
          ease: "power1.out",
          textContent: ``,
        });
      }
    }

    try {
      const updateResponse = await EditKid(editedKidData);
      if (updateResponse) {
        setEditKidInfo((previousValue) => !previousValue);
      } else {
        console.log("something else");
        console.log(updateResponse);
        setEditKidInfo((previousValue) => !previousValue);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteKid = async () => {
    setOpenDeleteKidModal(true);
  };

  const handleConfirmDeleteKid = async () => {
    const deleteResult = await DeleteKid(kid.id);
    setOpenDeleteKidModal(false);
  };

  const handleRemoveKid = async () => {
    setOpenRemoveKidModal(true);
  };

  const handleConfirmRemoveKid = async () => {
    const removeResult = await removeAdultKidRelationship(currentUser, kid.id);
    setOpenRemoveKidModal(false);
  };

  const cancelKidEdits = async () => {
    setKidFirstName(kid.first_name);
    setKidLastName(kid.last_name);
    setKidBirthday(kid.birthday);
    setKidFirstNameOnly(kid.first_name_only);
    setKidFirstNameOnly(kid.first_name_only);
    setEditKidInfo(false);
    setKidFirstNameBlank(false);
    setKidLastNameBlank(false);
    setKidTooOld(false);
    setKidProfilePic(kid.profile_pic);
  };

  const { contextSafe } = useGSAP();

  const handleShowFriendGroup = contextSafe(() => {
    if (friendGroupRef.current) {
      if (!showFriendGroup) {
        gsap.to(friendGroupRef.current, {
          height: "auto",
          autoAlpha: 1,
          ease: "power2.inOut",
          duration: 0.8,
        });
        setShowFriendGroup((previousValue) => !previousValue);
        //trying to get element to scroll into view when opened. currently seems to be re-rendering parent and causing visual jump
        // upcomingPlaydatesRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        gsap.to(friendGroupRef.current, {
          height: 0,
          autoAlpha: 0,
          ease: "power2.inOut",
          duration: 0.8,
        });
        setShowFriendGroup((previousValue) => !previousValue);
      }
    }
  })

  const handleRemoveFromFriendGroup = async (kid_id: string, friend_group_id: string) => {
    try {
      const removedKid = await removeKidFromFriendGroup(kid_id, friend_group_id)
      console.log(removedKid)
    } catch (error) {
      console.error("Error removing kid from Friend Group: ", error)
    }
  }

  // const getFriendGroups = useCallback(async () => {
  //   console.log('calling getFriendGroups')
  //   try {
  //     const { data: friendGroupData, error: friendGroupError } = await supabaseClient
  //       .from("Friend_Group")
  //       .select("*")
  //       .eq("kid_owner", kid.id)
  //     if (friendGroupError) {
  //       throw friendGroupError
  //     }
  //     console.log(friendGroupData[0])
  //     // Use a temporary array to collect friend groups
  //     const tempFriendGroups = [];
  //     // Clear previous friend groups before setting new ones
  //     setFriendGroups([]);
  //     //use for...of to handle await in each fetch from supabase
  //     //use returns to ensure correct typing of response. once again supabase expecting an array but returning an object. this return overrides that
  //     for (const friendGroup of friendGroupData) {
  //       const { data: friendGroupMembers, error: friendGroupMembersError } = await supabaseClient
  //         .from("Friend_Group_Members")
  //         .select("kid_uid, Kids(primary_caregiver, first_name, first_name_only, last_name, profile_pic)")
  //         .eq("friend_group_uid", friendGroup.id)
  //         .returns<SupabaseFriendGroupMemberType[]>();
  //       if (friendGroupMembersError) {
  //         throw friendGroupMembersError
  //       }
  //       console.log(friendGroupMembers)
  //       const friendGroupData = {
  //         id: friendGroup.id,
  //         group_name: friendGroup.group_name,
  //         kid_owner: friendGroup.kid_owner,
  //         //map group members to extract from uid and use a string
  //         friend_group_members: friendGroupMembers.map((member: SupabaseFriendGroupMemberType) =>
  //         ({
  //           kid_id: member.kid_uid,
  //           primary_caregiver_id: member.Kids.primary_caregiver || '',
  //           profile_pic: member.Kids.profile_pic || '',
  //           first_name: member.Kids.first_name,
  //           last_name: member.Kids.last_name,
  //           first_name_only: member.Kids.first_name_only
  //         }))
  //           // Sort by first name
  //           .sort((a, b) => a.first_name.localeCompare(b.first_name)),
  //       }
  //       console.log(friendGroupData)
  //       console.log(friendGroupMembers)
  //       tempFriendGroups.push(friendGroupData)

  //     }
  //     setFriendGroups(tempFriendGroups)

  //   } catch (error) {
  //     console.error("There was an error getting friend groups in the kid card", error)
  //   }
  // }, [kid, supabaseClient]
  // )

  // useEffect(() => {
  //   getFriendGroups();
  // }, [getFriendGroups])

  // useEffect(() => {
  //   const subscriptions: RealtimeChannel[] = []

  //   const createSubscriptions = () => {
  //     friendGroups.forEach((group) => {
  //       const subscription = supabaseClient
  //         .channel(`friend_groups_subscription_${group.id}`)
  //         .on(
  //           "postgres_changes",
  //           {
  //             event: "*",
  //             schema: "public",
  //             table: "Friend_Group_Members",
  //             // filter: `friend_group_uid=eq.${group.id}`,
  //           },
  //           (payload) => {
  //             console.log('Received Payload', payload)
  //             getFriendGroups();
  //           },
  //         )
  //         .subscribe((status) => {
  //       console.log(`Subscription status for friend_groups_subscription_${group.id}:`, status);
  //     });
  //       console.log(subscription)
  //       subscriptions.push(subscription)
  //     })
  //   }

  //   createSubscriptions();

  //   return () => {
  //     subscriptions.forEach((subscription) => {
  //       supabaseClient.removeChannel(subscription);
  //     })
  //   };

  // }, [friendGroups, getFriendGroups])

  // console.log(friendGroups)

  return (
    <>
      <div key={kid.id} className="singleKid w-full flex flex-col gap-4 overflow-hidden rounded-xl bg-inputBG p-2 xl:w-3/4">
        <div className="flex w-full items-start justify-between gap-4">
          <div
            id="kidProfilePicContainer"
            className="flex w-1/4 flex-col items-center justify-start"
          >
            <div
              id="kidProfilePic"
              className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appBlue bg-appBG"
            >
              <Image
                src={kidProfilePic || "/pics/generic_profile_pic.webp"}
                alt="profile picture"
                className=""
                fill={true}
                style={{ objectFit: "cover" }}
              ></Image>
            </div>
            {/* <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-blueGradient hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Edit pic</button> */}
          </div>
          <div className="flex w-3/4 flex-col gap-y-1 transition-all">
            {editKidInfo ? (
              <form ref={editFormRef}>
                {/* <form action={editKidWithId}> */}
                <p
                  id="firstNameErrorMessage"
                  ref={firstNameErrorMessageRef}
                  className="max-h-0 text-xs font-bold text-red-700 opacity-0"
                ></p>
                <input
                  id="kidsFirstNameInput"
                  name="first_name"
                  type="text"
                  placeholder="First name"
                  required={true}
                  className={`mb-2 w-2/3 rounded border-2 p-1 text-sm ${kidFirstNameBlank ? "border-red-700" : "border-appBlue"}`}
                  value={kidFirstName}
                  onChange={(event) => {
                    setKidFirstName(event.target.value);
                  }}
                ></input>
                <p
                  id="lastNameErrorMessage"
                  ref={lastNameErrorMessageRef}
                  className="max-h-0 text-xs font-bold text-red-700 opacity-0"
                ></p>
                <input
                  id="kidsLastNameInput"
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  required={true}
                  className={`mb-2 w-2/3 rounded border-2 p-1 text-sm ${kidLastNameBlank ? "border-red-500" : "border-appBlue"}`}
                  value={kidLastName}
                  onChange={(event) => {
                    setKidLastName(event.target.value);
                  }}
                ></input>
                <div className="mb-2 flex w-full text-xs">
                  <input
                    type="checkbox"
                    id="showLastNameToggle"
                    className="mr-2"
                    checked={kidFirstNameOnly}
                    onChange={(event) => {
                      setKidFirstNameOnly(event.target.checked);
                    }}
                  ></input>
                  <label htmlFor="showLastNameToggle">First name only</label>
                </div>
                <div className="block w-full text-xs">
                  <p
                    id="birthdayErrorMessage"
                    ref={birthdayErrorMessageRef}
                    className="max-h-0 text-xs font-bold text-red-700 opacity-0"
                  ></p>
                  <label htmlFor="birthday" className="mr-2">
                    Birthday
                  </label>
                  <input
                    id="kidsBirthdayInput"
                    name="birthday"
                    type="date"
                    className={`ml-2 w-2/3 rounded border-2 p-1 text-sm ${kidTooOld ? "border-red-500" : "border-appBlue"}`}
                    value={kidBirthday}
                    onChange={(event) => {
                      setKidBirthday(event.target.value);
                    }}
                  ></input>
                </div>

                <div
                  id="defaultProfilePics"
                  className="flex w-full flex-wrap justify-center gap-2 py-1 transition-all"
                >
                  <h4 className="mb-2 w-full text-xs font-bold">
                    Choose default avatar
                  </h4>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="dinoProfilePic"
                    value="/pics/dino_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/dino_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="dinoProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/dino_profile_pic.webp"
                      alt="Default Dino Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="dogProfilePic"
                    value="/pics/dog_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/dog_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="dogProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/dog_profile_pic.webp"
                      alt="Default Dog Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="genericProfilePic"
                    value="/pics/generic_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/generic_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="genericProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/generic_profile_pic.webp"
                      alt="Default generic Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="knightProfilePic"
                    value="/pics/knight_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/knight_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="knightProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/knight_profile_pic.webp"
                      alt="Default knight Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="princessProfilePic"
                    value="/pics/princess_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/princess_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="princessProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/princess_profile_pic.webp"
                      alt="Default princess Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="robot1ProfilePic"
                    value="/pics/robot1_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/robot1_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="robot1ProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/robot1_profile_pic.webp"
                      alt="Default robot1 Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="robot2ProfilePic"
                    value="/pics/robot2_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/robot2_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="robot2ProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/robot2_profile_pic.webp"
                      alt="Default robot2 Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="robot3ProfilePic"
                    value="/pics/robot3_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/robot3_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="robot3ProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/robot3_profile_pic.webp"
                      alt="Default robot3 Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="superheroProfilePic"
                    value="/pics/superhero_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/superhero_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="superheroProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/superhero_profile_pic.webp"
                      alt="Default superhero Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="unicornProfilePic"
                    value="/pics/unicorn_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/unicorn_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="unicornProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/unicorn_profile_pic.webp"
                      alt="Default unicorn Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="fairyProfilePic"
                    value="/pics/fairy_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/fairy_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="fairyProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/fairy_profile_pic.webp"
                      alt="Default fairy Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                  <input
                    type="radio"
                    name="profile_pic"
                    id="ninjaProfilePic"
                    value="/pics/ninja_profile_pic.webp"
                    onChange={(event) => {
                      setKidProfilePic(event.target.value);
                    }}
                    className="hidden"
                    defaultChecked={
                      kidProfilePic === "/pics/ninja_profile_pic.webp"
                    }
                  />
                  <label
                    htmlFor="ninjaProfilePic"
                    className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                  >
                    <Image
                      src="/pics/ninja_profile_pic.webp"
                      alt="Default ninja Profile Pic"
                      className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                      fill={true}
                      style={{ objectFit: "cover" }}
                    ></Image>
                  </label>
                </div>
                <div className="block w-full text-xs">
                  <button
                    className="w-90 mr-2 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={(event) => saveKidEdits(event)}
                    disabled={pending}
                  >
                    Save New Info
                  </button>
                  {/* <SubmitButton text='Save New Info' /> */}
                  <button
                    className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={cancelKidEdits}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div ref={readOnlyKidContentRef}>
                <p className="w-full">
                  {kidFirstName} {kidLastName}
                </p>
                {kid.primary_caregiver === currentUser ? (
                  <p className="max-w-fit rounded-lg border-appBlue bg-appGold p-1 text-xs">
                    Primary Caregiver
                  </p>
                ) : null}
                <div className="block w-full text-xs">
                  {kidFirstNameOnly
                    ? `Show only first name in search`
                    : `Show full name in search`}
                </div>
                <div className="flex w-full text-xs">
                  <label htmlFor="birthday" className="mr-2">
                    Birthday:{" "}
                  </label>
                  <input
                    disabled
                    type="date"
                    id="birthday"
                    className="w-4/6 rounded"
                    value={kidBirthday ? kidBirthday : undefined}
                  ></input>
                </div>
                <p className="text-xs">
                  {kidAge ? `${kidAge} years old` : null}
                </p>
                <div className="block w-full text-xs">
                  <button
                    className="w-90 mr-2 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={handleEditKid}
                  >
                    Edit Kid Info
                  </button>
                  {kid.primary_caregiver === currentUser ? (
                    <button
                      className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                      onClick={handleDeleteKid}
                    >
                      Delete Kid
                    </button>
                  ) : (
                    <button
                      className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                      onClick={handleRemoveKid}
                    >
                      Remove Kid
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* <div className='w-full'>
                                        <p className='text-sm'>Parents: parent names</p>
                                        <p className='text-sm'>Caregivers: caregiver names</p>
                                        <div className='flex justify-between w-full my-4'>
                                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-blueGradient hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Parent</button>
                                            <button className='px-2 w-90 text-xs cursor-pointer py-2 bg-appGold hover:bg-blueGradient hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' >Add New Caregiver</button>
                                        </div>
                                    </div> */}
        {/* {friendGroups.length > 0 ?
          <div>
            <div className='w-full bg-blueGradient bg-appBlue text-appBG flex p-2 rounded-md'>
              <h3>{`${kid.first_name}${kid.first_name.slice(-1) === 's' ? "'" : "'s"} Friend Group`}</h3>
              <div className=" ml-2 transform cursor-pointer rounded-md bg-appGold p-2 duration-300 ease-in-out hover:scale-125" onClick={handleShowFriendGroup} >
                <Image
                  src={`/icons/down_arrow.webp`}
                  width={12}
                  height={13}
                  alt="down icon to show more details"
                  title="more details"
                  className={`transform duration-700 ease-in-out ${showFriendGroup ? "-rotate-180" : "rotate-0"}`}
                ></Image>
              </div>
            </div>
            <div ref={friendGroupRef} className="flex h-0 flex-col gap-2 overflow-y-hidden px-4 pt-2 opacity-0" >
              {friendGroups.map((group) => {
                return (
                  <div key={`${group.id}${kid.first_name}`}>
                    {group.friend_group_members.length > 0 ?
                      group.friend_group_members?.map((member) => {
                        return (
                          <div key={`${member.kid_id}${group.id}`} className="mb-2 flex w-full items-center justify-start rounded-lg bg-appGold p-2 text-sm" >
                            <div className="relative mr-4 h-5 w-5 rounded-full">
                              <Image
                                src={`${member.profile_pic}`}
                                fill={true}
                                alt={`profile picture of ${member.first_name}`}
                                style={{ objectFit: "cover" }}
                                className="rounded-full"
                              />
                            </div>
                            <p className='w-3/4'>
                              {member.first_name} {member.first_name_only ? '' : member.last_name}
                            </p>
                            <button className=" w-28 transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50 " onClick={() => handleRemoveFromFriendGroup(member.kid_id, group.id)}>Remove</button>
                          </div>
                        )
                      })
                      :
                      <div>
                        No members yet.
                      </div>
                    }
                  </div>
                )
              })}
            </div>
          </div>
          :
          null} */}
        <DashboardFriendGroupSection {...kid} />
      </div >
      {
        openRemoveKidModal ? (
          <dialog
            ref={removeKidModalRef}
            className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur"
          >
            <div className="m-auto w-3/4 rounded-xl bg-appGold p-4">
              <div className="flex flex-col flex-wrap items-center text-sm">
                <p className="mb-4 block text-center">
                  {`This will remove your access to `}
                  <span className="font-bold">
                    {kidFirstName} {kidLastName}
                  </span>
                  .
                </p>
                <p className="mb-4 block text-center">
                  This does NOT delete the kid from the system.
                </p>
                <p className="mb-4 block text-center">

                  Deleting can ONLY be done by the Primary Caregiver
                </p>
                <p className="mb-4 block text-center">
                  {`Do you want to remove `}
                  <span className="font-bold">
                    {kidFirstName} {kidLastName}
                  </span>
                  ?
                </p>
                <br />
                <div
                  id="removeModalButtonContainer"
                  className="flex w-full flex-col"
                >
                  <button
                    type="button"
                    className="mb-4 mr-2 mt-2 w-full transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={handleConfirmRemoveKid}
                  >
                    Remove {kidFirstName} {kidLastName}
                  </button>
                  <button
                    type="button"
                    className="mt-2 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setOpenRemoveKidModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </dialog >
        ) : null
      }
      {
        openDeleteKidModal ? (
          <dialog
            ref={deleteKidModalRef}
            className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur"
          >
            <div className="m-auto w-3/4 rounded-xl bg-appGold p-4">
              <div className="flex flex-col items-center">
                <p className="mb-4 block text-center">
                  {`This will PREMANENTLY DELETE `}
                  <span className="font-bold">
                    {kidFirstName} {kidLastName}
                  </span>{" "}
                  from the app.{" "}
                </p>
                <p className="mb-4 block text-center">This CAN NOT be undone.</p>
                <p className="mb-4 block text-center">
                  {`Deleting can only be done by the Primary Caregiver`}
                </p>
                <p className="mb-4 block text-center">
                  {`Do you want to PERMANENTLY DELETE `}
                  <span className="font-bold">
                    {kidFirstName} {kidLastName}
                  </span>
                  ?
                </p>
                <br />
                <button
                  type="button"
                  className="mb-4 mr-2 mt-2 w-full transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs font-bold text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleConfirmDeleteKid}
                >
                  DELETE {kidFirstName} {kidLastName}
                </button>
                <button
                  type="button"
                  className="mt-2 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => setOpenDeleteKidModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </dialog>
        ) : null
      }
    </>
  );
}
import supabaseClient from "@/utils/supabase/client";
import { AdultsType, FriendGroupMembersType, FriendGroupType, KidsType, SupabaseFriendGroupMemberType } from "@/utils/types/userTypeDefinitions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { removeKidFromFriendGroup } from "@/utils/actions/playdateActions";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function DashboardFriendGroupSection(kid: KidsType) {

  const friendGroupRef = useRef<HTMLDivElement | null>(null)
  const [showFriendGroup, setShowFriendGroup] = useState(false)
  const [friendGroups, setFriendGroups] = useState<FriendGroupType[]>([])

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
    // Optimistically update the UI
    setFriendGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === friend_group_id
          ? { ...group, friend_group_members: group.friend_group_members.filter(member => member.kid_id !== kid_id) }
          : group
      )
    );

    try {
      const removedKid = await removeKidFromFriendGroup(kid_id, friend_group_id)
    } catch (error) {
      console.error("Error removing kid from Friend Group: ", error)
    }
  }

  const renderedFriendGroupMember = (member: FriendGroupMembersType, group: FriendGroupType) => {
    return (
      <div key={`${member.kid_id}`} className="mb-2 flex w-full items-center justify-start rounded-lg bg-appGold p-2 text-sm" >
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
  }


  // const renderedFriendGroups = useMemo(() => {
  //   return friendGroups.map((group) => (
  //     <div key={`${group.id}${kid.first_name}`}>
  //     {group.friend_group_members.length > 0 ?
  //       group.friend_group_members?.map((member) => {
  //         return renderedFriendGroupMember(member, group)
  //       })
  //   return (
  //     <div key={`${member.kid_id}${group.id}`} className="mb-2 flex w-full items-center justify-start rounded-lg bg-appGold p-2 text-sm" >
  //       <div className="relative mr-4 h-5 w-5 rounded-full">
  //         <Image
  //           src={`${member.profile_pic}`}
  //           fill={true}
  //           alt={`profile picture of ${member.first_name}`}
  //           style={{ objectFit: "cover" }}
  //           className="rounded-full"
  //         />
  //       </div>
  //       <p className='w-3/4'>
  //         {member.first_name} {member.first_name_only ? '' : member.last_name}
  //       </p>
  //       <button className=" w-28 transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50 " onClick={() => handleRemoveFromFriendGroup(member.kid_id, group.id)}>Remove</button>
  //     </div>
  //   )
  // })
  //       :
  //       <div>
  //         No members yet.
  //       </div>
  //     }
  //   </div>
  //   ));
  // }, [friendGroups, handleRemoveFromFriendGroup]);

  const getFriendGroups = useCallback(async () => {
    try {
      const { data: friendGroupData, error: friendGroupError } = await supabaseClient
        .from("Friend_Group")
        .select("*")
        .eq("kid_owner", kid.id)
      if (friendGroupError) {
        throw friendGroupError
      }
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
            // Sort by first name
            .sort((a, b) => a.first_name.localeCompare(b.first_name)),
        }
        tempFriendGroups.push(friendGroupData)

      }
      setFriendGroups(tempFriendGroups)
    } catch (error) {
      console.error("There was an error getting friend groups in the kid card", error)
    }
  }, [kid.id])

  useEffect(() => {
    getFriendGroups();
  }, [getFriendGroups])

  useEffect(() => {

    const subscriptions: RealtimeChannel[] = []

    const createSubscriptions = () => {
      friendGroups.forEach((group) => {
        const subscription = supabaseClient
          .channel(`friend_groups_subscription_${group.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Friend_Group_Members",
              // filter: `friend_group_uid=eq.${group.id}`,
            },
            (payload) => {

              getFriendGroups();
            },
          )
          .subscribe((status, err) => {
            if (err) console.error('Friend Group Subscription error:', err);
           
          });

        subscriptions.push(subscription)
      })
    }
    createSubscriptions();

    return () => {
      subscriptions.forEach((subscription) => {
        supabaseClient.removeChannel(subscription);
      })
    };

  }, [kid, getFriendGroups, friendGroups])

  return (
    <>
      {friendGroups ?
        // friendGroups[0].friend_group_members.length > 0 ?
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
                <div key={`${group.id}`}>
                  {group.friend_group_members.length > 0 ?
                    group.friend_group_members?.map((member) => {
                      return renderedFriendGroupMember(member, group)
                      // return (
                      //   <div key={`${member.kid_id}${group.id}`} className="mb-2 flex w-full items-center justify-start rounded-lg bg-appGold p-2 text-sm" >
                      //     <div className="relative mr-4 h-5 w-5 rounded-full">
                      //       <Image
                      //         src={`${member.profile_pic}`}
                      //         fill={true}
                      //         alt={`profile picture of ${member.first_name}`}
                      //         style={{ objectFit: "cover" }}
                      //         className="rounded-full"
                      //       />
                      //     </div>
                      //     <p className='w-3/4'>
                      //       {member.first_name} {member.first_name_only ? '' : member.last_name}
                      //     </p>
                      //     <button className=" w-28 transform cursor-pointer rounded-lg border-2 border-red-700 bg-red-500 p-2 px-1 py-1 text-xs text-appGold duration-300 ease-in-out hover:bg-red-800 hover:text-white active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50 " onClick={() => handleRemoveFromFriendGroup(member.kid_id, group.id)}>Remove</button>
                      //   </div>
                      // )
                    })
                    :
                    <div>
                      No members yet.
                    </div>
                  }
                </div>
              )
            })}
            {/* {renderedFriendGroups} */}
          </div>
        </div>
        :
        null
      }

    </>
  );
}

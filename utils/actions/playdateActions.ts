"use server";

import { PostgrestError } from "@supabase/supabase-js";
import { locationType } from "../types/placeTypeDefinitions";
import {
  InviteStatusEnum,
  PlaydateType,
} from "../types/playdateTypeDefinitions";
import { AdultsType, FriendGroupType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";
import { NotificationsType } from "../types/notificationTypeDefinitions";
import { NotificationEnums } from "../enums/notificationEnums";

export async function acceptPlaydateInvite(
  playdate_id: string,
  kid_id: string,
): Promise<any> {
  try {
    const { data: updatedInviteData, error: updatedInviteError } =
      await supabaseClient
        .from("Playdate_Attendance")
        .update({ invite_status: InviteStatusEnum.accepted }) //update status column
        .eq("playdate_id", playdate_id)
        .eq("kid_id", kid_id)
        .select();
    if (updatedInviteError) {
      throw updatedInviteError;
    }
    return updatedInviteData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function AddPlaydate({
  location,
  host_id,
  host_kid_id,
}: {
  location: string;
  host_id: string;
  host_kid_id?: string;
}) {
  if (!location || location === "") {
    return;
  }
  if (!host_id || host_id === "") {
    return;
  }
  if (!host_kid_id || host_kid_id === "") {
    return;
  }
  const rawPlaydateData = {
    location: location,
    host_id: host_id,
    host_kid_id: host_kid_id,
  };

  try {
    //add playdate to playdate table
    const {
      data: newPlaydateData,
      error: newPlaydateError,
    }: { data: PlaydateType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Playdates")
        .insert([rawPlaydateData])
        .select("id")
        .single();
    if (newPlaydateError) {
      throw handleSupabaseError(newPlaydateError);
    }
    //add host kid to attendance table
    if (newPlaydateData) {
      const inviteAttendanceData = {
        playdate_id: newPlaydateData.id,
        kid_id: host_kid_id,
        invite_status: InviteStatusEnum.accepted,
      };

      //add playdate invitation recipient to playdate attendace table
      const {
        data: newPlaydateInviteAttendance,
        error: newPlaydateInviteAttendanceError,
      }: { data: PlaydateType | null; error: PostgrestError | null } =
        await supabaseClient
          .from("Playdate_Attendance")
          .insert([inviteAttendanceData])
          .select("id")
          .single();
      if (newPlaydateInviteAttendanceError) {
        throw handleSupabaseError(newPlaydateInviteAttendanceError);
      }
    }
    return newPlaydateData;
  } catch (error) {
    console.error("Unexpected error:", error); // Log unexpected errors
    return undefined; // Indicate failure (optional)
  }
}

export async function deletePlaydate(playdateId: string) {
  try {
    const {
      data: deletedPlaydateData,
      error: deletedPlaydateDataError,
    }: { data: PlaydateType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Playdates")
        .delete()
        .eq("id", playdateId)
        .single();
  } catch (error) {
    console.error(error);
  }
}

export async function fetchPlaceData(placeID: string) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;
  if (!mapsApiKey) {
    throw new Error("Google Places API key is not set");
  }

  // Use the Place Details endpoint
  const baseURL = `https://places.googleapis.com/v1/places/${placeID}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": mapsApiKey,
      "X-Goog-FieldMask":
        "id,displayName,internationalPhoneNumber,formattedAddress,location,businessStatus,currentOpeningHours,goodForChildren,editorialSummary,rating,iconMaskBaseUri,iconBackgroundColor,primaryType,photos",
    },
  };
  try {
    const response = await fetch(baseURL, options);
    if (!response.ok) {
      throw new Error(
        `Error fetching playdate location data: ${response.status} - ${response.statusText}`,
      ); // Include status text for more info
    }
    const fetchedPlaceData = await response.json();
    return fetchedPlaceData;
  } catch (error) {
    console.error(error);
  }
}

export async function getKidsPlaydateData(adultId: string) {
  let playdates;
  const { data: kidsDataForPlaydate, error: kidsDataForPlaydateError } =
    await supabaseClient.from("Adult_Kid").select("*").eq("adult_id", adultId);
  if (kidsDataForPlaydateError) {
    throw kidsDataForPlaydateError;
  }
  if (kidsDataForPlaydate) {
    const updatedKids = await Promise.all(
      kidsDataForPlaydate.map(async (kid) => {
        const { data: playdatesForKid, error: playdatesForKidError } =
          await supabaseClient
            .from("Playdate_Attendance")
            .select(
              "*, Playdates(location, host_id, time, host_notes, host_kid_id), Kids(first_name, last_name, first_name_only, profile_pic)",
            )
            .eq("kid_id", kid.kid_id);
        if (playdatesForKidError) {
          throw playdatesForKidError;
        }
        return { ...kid, playdates: playdatesForKid };
      }),
    );
    playdates = updatedKids.flatMap((kid) => kid.playdates);
  }
  return playdates;
}

export async function inviteFriendGroup(friendGroup: FriendGroupType, playdate: PlaydateType,) {
  try {
    if (friendGroup.friend_group_members) {
      for (const friend of friendGroup.friend_group_members) {

        const inviteAttendanceData = {
          playdate_id: playdate.id,
          kid_id: friend.kid_id,
          invite_status: InviteStatusEnum.invited,
        };
        //add playdate invitation recipient to playdate attendace table
        const {
          data: newPlaydateInviteAttendance,
          error: newPlaydateInviteAttendanceError,
        }: { data: PlaydateType | null; error: PostgrestError | null } =
          await supabaseClient
            .from("Playdate_Attendance")
            .upsert([inviteAttendanceData])
            .select("id")
            .single();
        if (newPlaydateInviteAttendanceError) {
          if (newPlaydateInviteAttendanceError.code === '23505') { // Unique constraint violation
            console.log('This kid has already been invited to this playdate');
            // Handle the case where the kid is already invited
          } else {
            console.error('Error sending invitation:', newPlaydateInviteAttendanceError);
            // Handle other errors
          }
        } else {
          console.log('Invitation sent successfully');
          // Handle successful invitation
        }
        if (newPlaydateInviteAttendance) {
          const newInviteData = {
            sender_id: playdate.host_id,
            receiver_id: friend.primary_caregiver_id,
            kid_id: friend.kid_id,
            notification_type: NotificationEnums.inviteToPlaydate,
            playdate_id: playdate.id,
          };
          const {
            data: newPlaydateInvite,
            error: newPlaydateInviteError,
          }: { data: NotificationsType | null; error: PostgrestError | null } =
            await supabaseClient
              .from("Notifications")
              .insert(newInviteData)
              .single();
          if (newPlaydateInviteError) {
            throw handleSupabaseError(newPlaydateInviteError);
          }
          return newPlaydateInvite;
        }
        return newPlaydateInviteAttendance;

      }
    }
  } catch (error) {
    console.error("Error inviting friends to the playdate:", error);
  }
}

export async function addKidToFriendGroup(friendGroupId: string, kidId: string) {
  const newGroupMemberData = {
    friend_group_uid: friendGroupId,
    kid_uid: kidId
  }
  try {
    const { data: addKidToGroup, error: addKidToGroupError } = await supabaseClient
      .from("Friend_Group_Members")
      .insert([newGroupMemberData]);
    if (addKidToGroupError) {
      if (addKidToGroupError.code === '23505') { // Unique constraint violation
        console.log('This kid is already in this friend group');
        // Handle the case where the kid is already invited
      } else {
        console.error('Error adding to the friend grop:', addKidToGroupError);
        // Handle other errors
      }
    } else {
      console.log('added to the friend group successfully');
      // Handle successful invitation
    }
  } catch (error) {
    console.log('There was an error adding to the friend group', error)
  }
}

export async function inviteKidToPlaydate(
  kidtoInvite: string,
  invitedKidsPrimary: string,
  playdate: PlaydateType,
) {
  const inviteAttendanceData = {
    playdate_id: playdate.id,
    // host_kid_id:playdate.kid_id,
    kid_id: kidtoInvite,
    invite_status: InviteStatusEnum.invited,
  };
  try {
    //add playdate invitation recipient to playdate attendace table
    const {
      data: newPlaydateInviteAttendance,
      error: newPlaydateInviteAttendanceError,
    }: { data: PlaydateType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Playdate_Attendance")
        .insert([inviteAttendanceData])
        .select("id")
        .single();
    if (newPlaydateInviteAttendanceError) {
      if (newPlaydateInviteAttendanceError.code === '23505') { // Unique constraint violation
        console.log('This kid has already been invited to this playdate');
        // Handle the case where the kid is already invited
      } else {
        console.error('Error sending invitation:', newPlaydateInviteAttendanceError);
        // Handle other errors
      }
    } else {
      console.log('Invitation sent successfully');
      // Handle successful invitation
    }
    if (newPlaydateInviteAttendance) {
      const newInviteData = {
        sender_id: playdate.host_id,
        receiver_id: invitedKidsPrimary,
        kid_id: kidtoInvite,
        notification_type: NotificationEnums.inviteToPlaydate,
        playdate_id: playdate.id,
      };
      const {
        data: newPlaydateInvite,
        error: newPlaydateInviteError,
      }: { data: NotificationsType | null; error: PostgrestError | null } =
        await supabaseClient
          .from("Notifications")
          .insert(newInviteData)
          .single();
      if (newPlaydateInviteError) {
        throw handleSupabaseError(newPlaydateInviteError);
      }
      return newPlaydateInvite;
    }
    return newPlaydateInviteAttendance;
  } catch (error) {
    console.error("Unexpected error:", error); // Log unexpected errors
    return undefined; // Indicate failure by returning an error condition(optional)
  }
}

export async function maybePlaydateInvite(playdate_id: string, kid_id: string) {
  try {
    const { data: updatedInviteData, error: updatedInviteError } =
      await supabaseClient
        .from("Playdate_Attendance")
        .update({ invite_status: InviteStatusEnum.maybe }) //update status column
        .eq("playdate_id", playdate_id)
        .eq("kid_id", kid_id)
        .select();
    if (updatedInviteError) {
      throw updatedInviteError;
    }
    return updatedInviteData;
  } catch (error) {
    console.error(error);
  }
}

export async function rejectPlaydateInvite(
  playdate_id: string,
  kid_id: string,
) {
  try {
    const { data: updatedInviteData, error: updatedInviteError } =
      await supabaseClient
        .from("Playdate_Attendance")
        .update({ invite_status: InviteStatusEnum.rejected }) //update status column
        .eq("playdate_id", playdate_id)
        .eq("kid_id", kid_id)
        .select();
    if (updatedInviteError) {
      throw updatedInviteError;
    }
    return updatedInviteData;
  } catch (error) {
    console.error(error);
  }
}

export async function removeKidFromFriendGroup(kid_id:string, friend_group_id:string) {
  try {
    const {data:friendData, error:friendDataError} = await supabaseClient
    .from("Friend_Group_Members")
    .delete()
    .eq('friend_group_uid', friend_group_id)
    .eq('kid_uid', kid_id)
    .single()
    if(friendDataError) {
      throw friendDataError
    }
    return friendData
  }catch(error) {
    console.error("Error removing kid from friend group: ", error)
  }
}

function handleSupabaseError(error: PostgrestError): Error {
  const { message, details } = error;
  console.error("Error adding record:", message, details);
  // Handle specific error codes (e.g., display user-friendly messages):
  switch (error.code) {
    case "42701": // Unique constraint violation (e.g., duplicate entry)
      return new Error("A record with that name already exists.");
    case "42P01": // Missing required field
      return new Error("Please fill in all required fields.");
    default:
      // Handle other potential errors with generic or custom error messages
      return new Error("An error occurred modifying the database.");
  }
}

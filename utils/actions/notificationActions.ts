import { PostgrestError } from "@supabase/supabase-js";
import { NotificationEnums } from "../enums/notificationEnums";
import supabaseClient from "../supabase/client";
import { NotificationsType } from "../types/notificationTypeDefinitions";
import { RelationshipType } from "../types/userTypeDefinitions";

export async function addKidRequestNotification(
  sender_id: string,
  receiver_id: string,
  kid_id: string,
) {
  const notificationData: Omit<NotificationsType, "id"> = {
    sender_id: sender_id,
    receiver_id: receiver_id,
    kid_id: kid_id,
    notification_type: NotificationEnums.addKidRequest,
  };
  try {
    const { data, error } = await supabaseClient
      .from("Notifications")
      .insert(notificationData)
      .select();
    if (error) {
      throw handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function approveAddKidRequest({
  new_parent_id,
  sender_id,
  kid_id,
}: {
  new_parent_id: string;
  sender_id: string;
  kid_id: string;
}) {
  const notificationData: Omit<NotificationsType, "id"> = {
    sender_id: sender_id,
    receiver_id: new_parent_id,
    kid_id: kid_id,
    notification_type: NotificationEnums.approveKidRequest,
  };
  try {
    const newRelationshipData = {
      relationship: "parent",
      kid_id: kid_id,
      adult_id: new_parent_id,
    };
    const {
      data: newRelationship,
      error: newRelationshipError,
    }: { data: RelationshipType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Adult_Kid")
        .insert(newRelationshipData)
        .single();
    if (newRelationshipError) {
      throw handleSupabaseError(newRelationshipError);
    }

    const { data, error } = await supabaseClient
      .from("Notifications")
      .insert(notificationData)
      .select();
    if (error) {
      throw handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteNotification(notification_id: string) {
  try {
    const { data, error } = await supabaseClient
      .from("Notifications")
      .delete()
      .eq("id", notification_id)
      .select();
    if (error) {
      throw handleSupabaseError(error);
    }
    
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function denyAddKidRequest({
  receiver_id,
  sender_id,
  kid_id,
}: {
  receiver_id: string;
  sender_id: string;
  kid_id: string;
}) {
  const notificationData: Omit<NotificationsType, "id"> = {
    sender_id: sender_id,
    receiver_id: receiver_id,
    kid_id: kid_id,
    notification_type: NotificationEnums.denyKidRequest,
  };
  try {
    const { data, error } = await supabaseClient
      .from("Notifications")
      .insert(notificationData)
      .select();
    if (error) {
      throw handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getNotificationNumber(adult_id: string) {
  try {
    const { data: notificationData, error: notificationError } =
      await supabaseClient
        .from("Notifications")
        .select("*")
        .eq("receiver_id", adult_id);
    if (notificationData && notificationData.length > 0) {
      return notificationData.length;
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inviteKidToPlaydateNotification(
  invitedKidId: string,
  playdateId: string,
) {}

export async function updatePlaydateStatusNotification({
  receiver_id,
  sender_id,
  kid_id,
  playdate_id,
}: {
  receiver_id: string;
  sender_id: string;
  kid_id: string;
  playdate_id: string;
}) {
  const notificationData: Omit<NotificationsType, "id"> = {
    sender_id: sender_id,
    receiver_id: receiver_id,
    kid_id: kid_id,
    notification_type: NotificationEnums.updatePlaydateStatus,
  };
  try {
    const { data, error } = await supabaseClient
      .from("Notifications")
      .insert(notificationData)
      .select();
    if (error) {
      throw handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function sendPlaydateUpdates(
  playdate_id: string,
  playdate_host: string,
) {
  try {
    const { data: playdateInviteData, error: playdateInviteDataError } =
      await supabaseClient
        .from("Playdate_Attendance")
        .select("kid_id")
        .eq("playdate_id", playdate_id);
    if (playdateInviteDataError) {
      throw handleSupabaseError(playdateInviteDataError);
    }

    const kidsWithParents = await Promise.all(
      playdateInviteData.map(async (kid) => {
        const { data: kidsParentData, error: kidsParentDataError } =
          await supabaseClient
            .from("Adult_Kid")
            .select("adult_id")
            .eq("kid_id", kid.kid_id);

        if (kidsParentDataError) {
          handleSupabaseError(kidsParentDataError);
        }

        return {
          kid_id: kid.kid_id,
          parents: kidsParentData || [],
        };
      }),
    );

    for (const kid of kidsWithParents) {
      if (kid.parents.length === 0) {
        break;
      }
      kid.parents.map(async (parent) => {
        const notificationData: Omit<NotificationsType, "id"> = {
          sender_id: playdate_host,
          receiver_id: parent.adult_id,
          kid_id: kid.kid_id,
          notification_type: NotificationEnums.changePlaydateTime,
          playdate_id: playdate_id,
        };
        const {
          data: newParentNotification,
          error: newParentNotificationError,
        } = await supabaseClient.from("Notifications").insert(notificationData);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function handleSupabaseError(error: PostgrestError): Error {
  const { message, details } = error;
  console.error("Error adding notification:", message, details);
  // Handle specific error codes (e.g., display user-friendly messages):
  switch (error.code) {
    case "42701": // Unique constraint violation (e.g., duplicate entry)
      return new Error("A notification already exists.");
    case "42P01": // Missing required field
      return new Error("Please fill in all required fields.");
    default:
      // Handle other potential errors with generic or custom error messages
      return new Error("An error occurred while adding the notification.");
  }
}

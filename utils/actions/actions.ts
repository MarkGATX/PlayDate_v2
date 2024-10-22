"use server";

import {
  AdultsType,
  FriendGroupType,
  KidsType,
  RelationshipType,
} from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";
import { PostgrestError, PostgrestResponse } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function AddKid(rawAddKidData: Omit<KidsType, "id">) {
  try {
    //add kid to kid table
    const {
      data: newKidData,
      error: newKidError,
    }: { data: KidsType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Kids")
        .insert([rawAddKidData])
        .select("id, first_name")
        .single();
    if (newKidError) {
      throw handleSupabaseError(newKidError);
    }
    // add kid to Adult_Kid table to show parent relationship
    if (newKidData) {
      const newRelationshipData: RelationshipType = {
        relationship: "parent",
        kid_id: newKidData.id,
        adult_id: rawAddKidData.primary_caregiver,
      };
      const {
        data: newRelationship,
        error: newRelationshipError,
      }: { data: RelationshipType | null; error: PostgrestError | null } =
        await supabaseClient
          .from("Adult_Kid")
          .insert([newRelationshipData])
          .single();
      if (newRelationshipError) {
        throw handleSupabaseError(newRelationshipError);
      }
      //add default friend group
      const newFriendGroupData = {
        group_name: `${newKidData.first_name}${newKidData.first_name.slice(-1) === "s" ? "'" : "'s"} friend group`,
        kid_owner: newKidData.id
      }
      const { data: newKidFriendGroup, error: newKidFriendGroupError }: { data: FriendGroupType | null; error: PostgrestError | null } = await supabaseClient
        .from("Friend_Group")
        .insert(newFriendGroupData)
        .single();
      if (newKidFriendGroupError) {
        throw handleSupabaseError(newKidFriendGroupError)
      }
      return newKidData;
    }
  } catch (error) {
    console.error("Unexpected error:", error); // Log unexpected errors
  }
}

export async function createNewFriendGroup(kidId:string, groupName:string) {
  if (!kidId) {
    return
  }
  const newGroupData:Omit<FriendGroupType, 'id' | 'friend_group_members'> = {
    kid_owner:kidId,
    group_name:groupName
  }
  try {
    const {data:newFriendGroupData, error:newFriendGroupError} = await supabaseClient
      .from('Friend_Group')
      .insert(newGroupData)
      .single();
      if (newFriendGroupError) {
        throw handleSupabaseError(newFriendGroupError)
      }
  } catch(error) {
    console.log('Error adding friend group: ', error)
  }
}

export async function DeleteKid(kidId: string) {
  if (!kidId) {
    return; // Handle the case where form has no data
  }
  try {
    const { data: deletedKidData, error: deletedKidError } =
      await supabaseClient.from("Kids").delete().eq("id", kidId).select();
    if (deletedKidError) {
      throw handleSupabaseError(deletedKidError);
    }
    return deletedKidData;
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

export async function EditKid(editedKidData: KidsType) {
  if (!editedKidData) {
    return; // Handle the case where form has no data
  }
  try {
    const { data: updatedKidData, error: updatedKidError } =
      await supabaseClient
        .from("Kids")
        .update(editedKidData)
        .eq("id", editedKidData.id)
        .select();
    if (updatedKidError) {
      throw handleSupabaseError(updatedKidError);
    }
    return updatedKidData;
  } catch (error) {
    console.error("Unexpected error:", error);
    return undefined;
  }
}

export async function EditAdult(
  editedAdultData: Omit<
    AdultsType,
    | "firebase_uid"
    | "Adult_Kid"
    | "Kids"
    | "profilePicURL"
    | "emergency_contact"
  >,
) {
  if (!editedAdultData) {
    return; // Handle the case where form has no data
  }
  try {
    const { data: updatedAdultData, error: updatedAdultError } =
      await supabaseClient
        .from("Adults")
        .update(editedAdultData)
        .eq("id", editedAdultData.id)
        .select();
    if (updatedAdultError) {
      throw handleSupabaseError(updatedAdultError);
    }
    return updatedAdultData;
  } catch (error) {
    console.error("Unexpected error:", error);
    return undefined;
  }
}



export async function removeAdultKidRelationship(
  adult_id: string,
  kid_id: string,
) {
  try {
    const {
      data: deletedRelationship,
      error: deletedRelationshipError,
    }: { data: RelationshipType | null; error: PostgrestError | null } =
      await supabaseClient
        .from("Adult_Kid")
        .delete()
        .eq("adult_id", adult_id)
        .eq("kid_id", kid_id)
        .single();
    if (deletedRelationshipError) {
      throw handleSupabaseError(deletedRelationshipError);
    }
    if (deletedRelationship) {
      return deletedRelationship;
    }
  } catch (error) {
    console.error(error);
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

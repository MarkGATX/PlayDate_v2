'use server'

import { AdultsType, KidsType, RelationshipType } from "../types/userTypeDefinitions"
import supabaseClient from "../supabase/client";
import { PostgrestError, PostgrestResponse } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function AddKid(rawAddKidData: Omit<KidsType, 'id'>) {

    try {
        //add kid to kid table
        const { data: newKidData, error: newKidError }: { data: KidsType | null; error: PostgrestError | null } = await supabaseClient
            .from('Kids')
            .insert([rawAddKidData])
            .select('id')
            .single()
        if (newKidError) {
            throw handleSupabaseError(newKidError)
        }
        console.log('New Kid Added: ', newKidData, newKidError)
        // add kid to Adult_Kid table to show parent relationship
        if (newKidData) {
            const newRelationshipData: RelationshipType = {
                relationship: 'parent',
                kid_id: newKidData.id,
                adult_id: rawAddKidData.primary_caregiver
                // adult_id: formData.get('primary_caregiver') as string
            }
            console.log(newRelationshipData)
            const { data: newRelationship, error: newRelationshipError }: { data: RelationshipType | null; error: PostgrestError | null } = await supabaseClient
                .from('Adult_Kid')
                .insert([newRelationshipData])
                .single()
            if (newRelationshipError) {
                throw handleSupabaseError(newRelationshipError)
            }
            return newKidData
        }
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
    }
}

export async function EditKid(editedKidData: KidsType) {
    if (!editedKidData) {
        return; // Handle the case where form has no data
    }
    try {
        const { data: updatedKidData, error: updatedKidError } = await supabaseClient
            .from('Kids')
            .update(editedKidData)
            .eq('id', editedKidData.id)
            .select()
        if (updatedKidError) {
            throw handleSupabaseError(updatedKidError)
        }
        console.log(updatedKidData)
        return updatedKidData
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
    }
}

export async function EditAdult(editedAdultData: Omit<AdultsType, 'firebase_uid' | 'Adult_Kid' | 'Kids' | 'profilePicURL' | 'emergency_contact'>) {
    if (!editedAdultData) {
        return; // Handle the case where form has no data
    }
    try {
        const { data: updatedAdultData, error: updatedAdultError } = await supabaseClient
            .from('Adults')
            .update(editedAdultData)
            .eq('id', editedAdultData.id)
            .select()
        if (updatedAdultError) {
            throw handleSupabaseError(updatedAdultError)
        }
        console.log(updatedAdultData)
        return updatedAdultData
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
    }
}

export async function removeAdultKidRelationship(adult_id: string, kid_id: string) {
    try {
        const { data: deletedRelationship, error: deletedRelationshipError }: { data: RelationshipType | null; error: PostgrestError | null } = await supabaseClient
            .from('Adult_Kid')
            .delete()
            .eq('adult_id', adult_id)
            .eq('kid_id', kid_id)
            .single()
        if (deletedRelationshipError) {
            throw handleSupabaseError(deletedRelationshipError)
        }
        if (deletedRelationship) {
            console.log('removed kid')
            return deletedRelationship
        }

    } catch (error) {
        console.error(error)
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
            return new Error("An error occurred while adding the record.");
    }
}


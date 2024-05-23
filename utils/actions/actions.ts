'use server'

import { KidsType, RelationshipType } from "../types/userTypeDefinitions"
import supabaseClient from "../supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export async function AddKid(formData: FormData) {

    if (!formData) {
        return; // Handle the case where form has no data
    }

    try {
        const rawAddKidData: Omit<KidsType, 'id'> = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            birthday: formData.get('birthday') as string,
            first_name_only: formData.get('first_name_only') === 'on',
            primary_caregiver: formData.get('primary_caregiver') as string
        }
        console.log(rawAddKidData)
        const { data: newKidData, error: newKidError }: { data: KidsType | null; error: PostgrestError | null } = await supabaseClient
            .from('Kids')
            .insert([rawAddKidData])
            .select('id')
            .single()
        if (newKidError) {
            throw handleSupabaseError(newKidError)
        }
        console.log('New Kid Added: ', newKidData, newKidError)
        if (newKidData) {
            const newRelationshipData: RelationshipType = {
                relationship: 'parent',
                kid_id: newKidData.id,
                adult_id: formData.get('primary_caregiver') as string
            }
            console.log(newRelationshipData)
            const { data: newRelationship, error: newRelationshipError }: { data: RelationshipType | null; error: PostgrestError | null } = await supabaseClient
                .from('Adult_Kid')
                .insert([newRelationshipData])
                .single()
            if (newRelationshipError) {
                throw handleSupabaseError(newRelationshipError)
            }
        }
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
    }
}

function handleSupabaseError(error: PostgrestError): Error {
    const { message, details } = error;
    console.error("Error adding kid:", message, details);
    // Handle specific error codes (e.g., display user-friendly messages):
    switch (error.code) {
        case "42701": // Unique constraint violation (e.g., duplicate entry)
            return new Error("A kid with that name already exists.");
        case "42P01": // Missing required field
            return new Error("Please fill in all required fields.");
        default:
            // Handle other potential errors with generic or custom error messages
            return new Error("An error occurred while adding the kid.");
    }
}
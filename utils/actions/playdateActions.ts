'use server'

import { PostgrestError } from "@supabase/supabase-js";
import { locationType } from "../types/placeTypeDefinitions";
import { PlaydateType } from "../types/playdateTypeDefinitions";
import { AdultsType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";

export async function AddPlaydate({ location, host, kid }: { location: string, host: string, kid?: string }) {
    if (!location || location === '') {
        return
    }
    if (!host || host === '') {
        return
    }
    if (!kid || kid === '') {
        return
    }
    const rawPlaydateData = {
        location: location,
        host_id: host,
        kid_id: kid
    }

    try {
        //add playdate to playdate table
        const { data: newPlaydateData, error: newPlaydateError }: { data: PlaydateType | null; error: PostgrestError | null } = await supabaseClient
            .from('Playdates')
            .insert([rawPlaydateData])
            .select('id')
            .single()
        if (newPlaydateError) {
            throw handleSupabaseError(newPlaydateError)
        }
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
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
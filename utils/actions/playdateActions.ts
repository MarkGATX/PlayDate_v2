'use server'

import { PostgrestError } from "@supabase/supabase-js";
import { locationType } from "../types/placeTypeDefinitions";
import { InviteStatusEnum, PlaydateType } from "../types/playdateTypeDefinitions";
import { AdultsType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";
import { NotificationsType } from "../types/notificationTypeDefinitions";
import { NotificationEnums } from "../enums/notificationEnums";

export async function AddPlaydate({ location, host_id, kid_id }: { location: string, host_id: string, kid_id?: string }) {
    if (!location || location === '') {
        return
    }
    if (!host_id || host_id === '') {
        return
    }
    if (!kid_id || kid_id === '') {
        return
    }
    const rawPlaydateData = {
        location: location,
        host_id: host_id,
        kid_id: kid_id
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
        return newPlaydateData
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure (optional)
    }
}

export async function fetchPlaceData(placeID: string) {
    const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;
    if (!mapsApiKey) {
        throw new Error('Google Places API key is not set');
    }

    // Use the Place Details endpoint
    const baseURL = `https://places.googleapis.com/v1/places/${placeID}`;
    console.log(baseURL)

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': mapsApiKey,
            'X-Goog-FieldMask': 'id,displayName,internationalPhoneNumber,formattedAddress,location,businessStatus,currentOpeningHours,goodForChildren,editorialSummary,rating,iconMaskBaseUri,iconBackgroundColor,primaryType,photos'
        },
    };
    try {
        const response = await fetch(baseURL, options);
        if (!response.ok) {
            throw new Error(`Error fetching playdate location data: ${response.status} - ${response.statusText}`); // Include status text for more info
        }
        const fetchedPlaceData = await response.json();
        console.log(fetchedPlaceData);
        return fetchedPlaceData;
    } catch (error) {
        console.log(error)
    }

}

export async function inviteKidToPlaydate(kidtoInvite: string, invitedKidsPrimary: string, playdate: PlaydateType) {
    const inviteAttendanceData = {
        playdate_id: playdate.id,
        kid_id: kidtoInvite,
        invite_status: InviteStatusEnum.invited
    }
    try {
        //add playdate to playdate table
        const { data: newPlaydateInviteAttendance, error: newPlaydateInviteAttendanceError }: { data: PlaydateType | null; error: PostgrestError | null } = await supabaseClient
            .from('Playdate_Attendance')
            .insert([inviteAttendanceData])
            .select('id')
            .single()
        if (newPlaydateInviteAttendanceError) {
            throw handleSupabaseError(newPlaydateInviteAttendanceError)
        }
        if (newPlaydateInviteAttendance) {
            const newInviteData = {
                sender_id: playdate.host_id,
                receiver_id: invitedKidsPrimary,
                kid_id: kidtoInvite,
                notification_type: NotificationEnums.inviteToPlaydate,
                playdate_id: playdate.id
            }
            const { data: newPlaydateInvite, error: newPlaydateInviteError }: { data: NotificationsType | null, error: PostgrestError | null } = await supabaseClient
                .from('Notifications')
                .insert(newInviteData)
                .single()
                if(newPlaydateInviteError) {
                    throw handleSupabaseError(newPlaydateInviteError)
                }
                return newPlaydateInvite
        }
        return newPlaydateInviteAttendance
    } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        return undefined; // Indicate failure by returning an error condition(optional)
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
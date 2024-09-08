'use server'

import { PostgrestError } from "@supabase/supabase-js";
import { KidsType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";

export async function searchForKids({ searchTerm }: { searchTerm: string }) {
    if (!searchTerm) {
        return []
    }
    try {
        if (searchTerm.includes(' ')) {
            const searchTermSplit = searchTerm.split(' ')
            const searchTermFirstName = searchTermSplit[0]
            const searchTermLastName = searchTermSplit[1]
            const { data: kidSearchData, error: kidSearchError }: { data: KidsType[] | null; error: PostgrestError | null } = await supabaseClient
                .from('Kids')
                .select('*')
                .or(`first_name.ilike.%${searchTermFirstName}%, last_name.ilike.%${searchTermLastName}%`)
            if (kidSearchError) {
                console.error('Error searching for kids:', kidSearchError);

            }
            return kidSearchData
        } else {
            const { data: kidSearchData, error: kidSearchError }: { data: KidsType[] | null; error: PostgrestError | null } = await supabaseClient
                .from('Kids')
                .select('*')
                .or(`first_name.ilike.%${searchTerm}%, last_name.ilike.%${searchTerm}%`)
                // .ilike('first_name', `%${searchTerm}%`)
            if (kidSearchError) {
                console.error('Error searching for kids:', kidSearchError);

            }
            return kidSearchData
        }
    } catch (error) {
        console.error('error in fetching kids in search: ', error)
    }

}

export async function fetchSearchedPlace(searchTerm: string) {
    const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;
    if (!mapsApiKey) {
        throw new Error('Google Places API key is not set');
    }

    // Use the Place Details endpoint
    const baseURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchTerm}&key=${mapsApiKey}`;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': mapsApiKey,
            // 'X-Goog-FieldMask': 'id,displayName,internationalPhoneNumber,formattedAddress,location,businessStatus,currentOpeningHours,goodForChildren,editorialSummary,rating,iconMaskBaseUri,iconBackgroundColor,primaryType,photos'
        },
    };
    try {
        const response = await fetch(baseURL, options);
        if (!response.ok) {
            throw new Error(`Error fetching playdate location data: ${response.status} - ${response.statusText}`); // Include status text for more info
        }
        const searchedPlaceData = await response.json();
        return searchedPlaceData;
    } catch (error) {
        console.error(error)
    }

}
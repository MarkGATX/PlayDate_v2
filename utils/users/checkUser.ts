
import { PostgrestError, createClient } from "@supabase/supabase-js";
import { AdultsType, NewUserType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
// const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;

// if (!SUPABASE_URL || !SUPABASE_KEY) {
//     throw new Error('Missing Supabase URL or API key');
// }

export async function checkUser(newUserData: NewUserType) {
    // if (!SUPABASE_URL || !SUPABASE_KEY) {
    //     throw new Error('Missing Supabase URL or API key');
    // }
    // const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    if (!newUserData) {
        return; // Handle the case where no user is logged in
    }

    try {
        const { data, error } = await supabaseClient
            .from('Adults')
            .select('id') // Select only the ID for efficiency
            .eq('firebase_uid', newUserData.firebase_uid);
        if (error) {
            console.error('Supabase query error:', error);
            return; // Handle potential errors
        }
        if (data.length > 0) { // User found in Supabase
            // Existing user handling (e.g., redirect to dashboard)
            console.log('user in supabase')
            return
        } else { // add user to supabase
            console.log('no user in supabase')
            const { data, error }: { data: AdultsType | null; error: PostgrestError | null } = await supabaseClient
                .from('Adults')
                .insert([newUserData]);
            if (error) {
                console.error('Error creating new Adult in AddNewUser: ', error)
                throw error
            } else if (data) {
                console.log('New Adult created in AddNewUser: ', data)
            }
        }
    } catch (error) {
        console.log(error)
    }
}
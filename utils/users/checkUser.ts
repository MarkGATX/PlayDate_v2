//MOVE TO SERVER ACTION?
import { PostgrestError, createClient } from "@supabase/supabase-js";
import { AdultsType, NewUserType } from "../types/userTypeDefinitions";
import supabaseClient from "../supabase/client";

export async function checkUser(newUserData: NewUserType) {

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
            return data[0].id
        } else { // add user to supabase
            const { data, error }: { data: AdultsType | null; error: PostgrestError | null } = await supabaseClient
                .from('Adults')
                .insert([newUserData]);
            if (error) {
                console.error('Error creating new Adult in AddNewUser: ', error)
                throw error
            } else if (data) {
                //UI notification of new user added
            }
        }
    } catch (error) {
        console.error(error)
    }
}
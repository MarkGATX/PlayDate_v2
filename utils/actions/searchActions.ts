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
        console.log('error in fetching kids in search: ', error)

    }

}
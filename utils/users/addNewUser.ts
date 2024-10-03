// import { useRouter } from "next/navigation"
// import { createClient } from "../supabase/server"
// import { AdultsType, NewUserData } from "../types/userTypeDefinitions";
// import { PostgrestError } from "@supabase/supabase-js";

// export async function AddNewUser(user: NewUserData) {
//     const supabase = await createClient();
//     const router = useRouter();
//     const { data, error }: { data: AdultsType | null; error: PostgrestError | null } = await supabase
//         .from('Adults')
//         .insert([
//             {
//                 first_name: user.first_name,
//                 last_name: user.last_name,
//                 profilePicURL: user.profilePicURL,
//                 firebase_uid: user.firebase_uid
//             }
//         ]);
//     if (error) {
//         console.error('Error creating new Adult in AddNewUser: ', error)
//         throw error
//     } else if (data ) {
//         console.log('New Adult created in AddNewUser: ', data)
//         // router.push(`/dashboard/${data.id}`)
//     }
// }

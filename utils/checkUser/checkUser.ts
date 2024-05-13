
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Router } from "next/router";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing Supabase URL or API key');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function checkUser(firebaseUser:string) {
    // const router = useRouter();
    if (!firebaseUser) {
      return; // Handle the case where no user is logged in
    }
    
    const { data, error } = await supabase
      .from('parents')
      .select('id') // Select only the ID for efficiency
      .eq('firebase_uid', firebaseUser);
  
    if (error) {
      console.error('Supabase query error:', error);
      return; // Handle potential errors
    }
  
    if (data.length > 0) { // User found in Supabase
      // Existing user handling (e.g., redirect to dashboard)
      return true
    } else { // Redirect to user creation page if not found
      return false 
    }
  }
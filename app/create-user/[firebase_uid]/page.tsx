'use client'
import { AuthContext } from "@/utils/firebase/AuthContext"
import { useParams } from "next/navigation";

import { useContext, useEffect, useState } from "react"

export default function Page() {
    const { user } = useContext(AuthContext)
    
    const params = useParams();

    // State flag for potential authorization error
    const [isAuthorized, setIsAuthorized] = useState(true);

    useEffect(() => {
        // Check user authorization if firebase_uid is available
        if (params.firebase_uid && user?.uid !== params.firebase_uid) {
            setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    }, [params.firebase_uid, user]); // Dependency array for useEffect

    if (!isAuthorized) {
        return <div>You are not authorized to see this page.</div>;
    }

    return (
        <main>
            <h2>Create your account...</h2>
            <p>{`We couldn't find an account for that login, so let's get you set up with a new one`}</p>
        </main>
    )
}
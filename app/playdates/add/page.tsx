'use client'

import { AuthContext } from "@/utils/firebase/AuthContext";
import { placesDataType } from "@/utils/types/placeTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { notFound } from "next/navigation";
import { useContext, useState } from "react";

export default function AddPlaydate() {
    const { user } = useContext(AuthContext)
    const [currentUser, setCurrentUser] = useState<AdultsType>()
    
    // if (!location || !currentUser) {
    //     notFound()
    // }

    return (
        <div></div>
    )
}
export type NewUserType = {
    first_name: string | undefined
    last_name: string | undefined
    email:string | null
    profilePicURL: string | null | undefined
    firebase_uid: string
}

export type AdultsType = {
    id:string
    first_name:string
    last_name:string
    phone_number?:string
    email:string | null
    show_last_name:boolean
    emergency_contact?:string
    profilePicURL: string | null | undefined
    firebase_uid:string
    Adult_Kid: AdultKidRelationshipType[]
    Kids: KidsType[]
}

export type AdultKidRelationshipType = {
    id:string
    adult_id:string
    kid_id:string
    relationship:string
}

export type KidsType = {
    id:string
    first_name:string
    last_name:string
    birthday?:string
    first_name_only:boolean
    primary_caregiver:string
    profile_pic?:string
   
}

export type RelationshipType = {
    relationship:string
    kid_id:string
    adult_id:string
}
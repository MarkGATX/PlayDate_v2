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
}
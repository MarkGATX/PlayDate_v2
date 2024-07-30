import { NotificationEnums } from "../enums/notificationEnums"
import { AdultsType, KidsType } from "./userTypeDefinitions"

export type NotificationsType = {
    id: string
    sender_id: string
    receiver_id: string
    kid_id?: string
    notification_type: NotificationEnums
    playdate_id?: string
}

export type NotificationDetailsType = {
    id: string
    sender:
    {
        id: string
        first_name: string
        last_name: string
        profilePicURL: string
    }
    kid:
    {
        id: string
        first_name:string
        last_name:string
        profile_pic: string
        primary_caregiver:string
        first_name_only:boolean
    }
    notification_type: NotificationEnums
    receiver: AdultsType
    receiver_id:string
    playdate_id?:string
    playdate_location?:string
    playdate_time:Date
    host_kid:
    {
        id: string
        first_name:string
        last_name:string
        profile_pic: string
        first_name_only:boolean
    }
}
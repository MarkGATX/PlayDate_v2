import { NotificationEnums } from "../enums/notificationEnums"
import { AdultsType, KidsType } from "./userTypeDefinitions"

export type NotificationsType = {
    id:string
    sender_id: string
    receiver_id: string
    kid_id?:string
    notification_type: NotificationEnums
    playdate_id?: string
}

export type NotificationDetailsType = {
    id:string
    sender:AdultsType
    kid:KidsType
    notification_type: NotificationEnums
    receiver:AdultsType
}
export type PlaydateType = {
    id:string
    type?: string
    location:string
    time:Date
    host_id:string
    host_name:nameType
    kid_id:string
    kid_name:nameType
    kid_first_name_only:boolean
}

type nameType = {
    first_name:string
    last_name:string
}

export type PlaydateAttendanceType = {
    id:string
    playdate_id:string
    kid_id:string
    invite_status:InviteStatusEnum
}

export enum InviteStatusEnum {
    invited = 'invited',
    accepted = 'accepted',
    rejected = 'rejected',
    maybe = 'maybe'

}

export type InviteStatusType = {
    invite_status:InviteStatusEnum
    Kids:InvitedKidType
}

export type InvitedKidType = {
    id:string
    last_name:string
    first_name:string
    first_name_only:boolean
    profile_pic:string
}
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
    attendace_status:AttendanceStatusType
}

export enum AttendanceStatusType {
    invited = 'invited',
    accepted = 'accepted',
    rejected = 'rejected',
    maybe = 'maybe'

}
import supabaseClient from "@/utils/supabase/client"
import { InvitedKidType, InviteStatusType } from "@/utils/types/playdateTypeDefinitions"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function PlaydateAttendanceTabs({ playdate }: { playdate: string }) {
    const [selectedTab, setSelectedTab] = useState<string>('yes')
    const [yesResponse, setYesResponse] = useState<InviteStatusType[]>([])
    const [noResponse, setNoResponse] = useState<InviteStatusType[]>([])
    const [maybeResponse, setMaybeResponse] = useState<InviteStatusType[]>([])
    const [invitedResponse, setInvitedResponse] = useState<InviteStatusType[]>([])
    const [attendanceData, setAttendanceData] = useState<InviteStatusType[] | null>(null);


    useEffect(() => {
        const getPlaydateAttendanceData = async () => {
            const { data: playdateAttendanceData, error: playdateAttendanceDataError } = await supabaseClient
                .from('Playdate_Attendance')
                .select('invite_status, Kids(id,first_name, last_name, profile_pic, first_name_only)')
                .eq('playdate_id', playdate)
                .returns<InviteStatusType[]>()

            if (playdateAttendanceData) {
                setAttendanceData(playdateAttendanceData)
            }

            console.log(playdateAttendanceData)
            if (playdateAttendanceData && playdateAttendanceData.length > 0) {
                let rawYesData: InviteStatusType[] = []
                let rawNoData: InviteStatusType[] = []
                let rawMaybeData: InviteStatusType[] = []
                let rawInvitedData: InviteStatusType[] = []
                playdateAttendanceData.forEach((attendee) => {

                    switch (attendee.invite_status) {
                        case 'accepted':
                            rawYesData.push(attendee);
                            break;
                        case 'rejected':
                            rawNoData.push(attendee);
                            break;
                        case 'maybe':
                            rawMaybeData.push(attendee);
                            break;
                        case 'invited':
                            rawInvitedData.push(attendee);
                            break;
                        default:
                            break;
                    }
                })
                // Update state in a single operation
                setYesResponse(rawYesData);
                setNoResponse(rawNoData);
                setMaybeResponse(rawMaybeData);
                setInvitedResponse(rawInvitedData);

            }
        }

        getPlaydateAttendanceData()

        const attendanceSubscription = supabaseClient
            .channel('supabase_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Playdate_Attendance',
                    filter: `playdate_id=eq.${playdate}`
                },
                (payload) => {
                    console.log('GET ATTENDANCE PAYLOAD: ', payload)
                    getPlaydateAttendanceData();

                })
            .subscribe()

        return () => {
            supabaseClient.removeChannel(attendanceSubscription)
        }

    }, [playdate])

    const handleClick = async (value: string) => {
        setSelectedTab(value)
    }

    console.dir(yesResponse)
    console.dir(noResponse)
    console.dir(maybeResponse.length > 0)
    console.dir(invitedResponse)


    return (
        attendanceData
            ?

            <section id='playdateAttendanceTabs' className='flex flex-col gap-2 items-start rounded-lg justify-start p-4 border-2 border-appBlue m-2'>
                < h3 className='font-bold' > Responses:</h3 >
                <div id='tabs' className='flex justify-between w-full gap-2'>
                    <div className={`w-1/4 relative flex justify-center items-center rounded-xl text-xs text-center cursor-pointer ${selectedTab === 'yes' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-1'}`} onClick={() => handleClick('yes')}>
                        {yesResponse.length > 0
                            ?
                            <>
                                <p>Yes</p>
                                <div className={`absolute -right-2 -top-2 rounded-full w-auto min-w-4 inline-block ${selectedTab === 'yes' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-2'}`}>{yesResponse.length}</div>
                            </>
                            :
                            <p>Yes</p>
                        }
                    </div>

                    <div className={`w-1/4 flex relative justify-center items-center rounded-xl text-xs text-center cursor-pointer ${selectedTab === 'no' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-1 '}`} onClick={() => handleClick('no')}>
                        {noResponse.length > 0
                            ?
                            <>
                                <p>No</p>
                                <div className={`absolute -right-2 -top-2 rounded-full w-auto min-w-4 inline-block ${selectedTab === 'no' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-2'}`}>{noResponse.length}</div>
                            </>
                            :
                            <p>No</p>
                        }
                    </div>
                    <div className={`w-1/4 relative flex justify-center items-center rounded-xl text-xs text-center cursor-pointer ${selectedTab === 'maybe' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-2'}`} onClick={() => handleClick('maybe')}>
                        {maybeResponse.length > 0
                            ?
                            <>
                            {console.log('Rendering Maybe with count')}
                                <p>Maybe</p>
                                <div className={`absolute -right-2 -top-2 rounded-full w-auto min-w-4 inline-block ${selectedTab === 'maybe' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-2'}`}>{maybeResponse.length}</div>
                            </>
                            :
                            <>
                            {console.log('Rendering Maybe with count')}
                            <p>Maybe</p>
                            </>
                        }
                    </div>
                    <div className={`w-1/4 relative flex justify-center items-center rounded-xl text-xs text-center cursor-pointer ${selectedTab === 'invited' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBlue border-1'}`} onClick={() => handleClick('invited')}>
                        {invitedResponse.length > 0
                            ?
                            <>
                                <p>Invited</p>
                                <div className={`absolute -right-2 -top-2 rounded-full w-auto min-w-4 inline-block ${selectedTab === 'invited' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBG border-2'}`}>{invitedResponse.length}</div>
                            </>
                            :
                            <p>Invited</p>
                        }
                    </div>
                </div>
                <div id='attendanceLists' className='h-auto max-h-44 overflow-y-auto w-full'>
                    {(() => {
                        switch (selectedTab) {
                            case ('yes'):
                                return (
                                    <>
                                        {yesResponse?.length === 0
                                            ?
                                            <p>No acceptance yet</p>
                                            :
                                            yesResponse.map((attendee) => {
                                                return (
                                                    <div className='w-full flex justify-start bg-appGold rounded-lg p-2 text-sm mb-2' key={`${attendee.Kids.id}AttendanceButton}`}>
                                                        <div className='w-5 h-5 relative rounded-full mr-4'>
                                                            <Image src={`${attendee.Kids.profile_pic}`} fill={true} alt={`profile picture of ${attendee.Kids.first_name}`} style={{ objectFit: 'cover' }} className='rounded-full ' />
                                                        </div>
                                                        <p>{attendee.Kids.first_name} {attendee.Kids.last_name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </>
                                );
                            case ('no'):
                                return (
                                    <>
                                        {noResponse?.length === 0
                                            ?
                                            <p>No rejections yet</p>
                                            :
                                            noResponse.map((attendee) => {
                                                return (
                                                    <div className='w-full flex justify-start bg-appGold rounded-lg p-2 text-sm mb-2' key={`${attendee.Kids.id}AttendanceButton}`}>
                                                        <div className='w-5 h-5 relative rounded-full mr-4'>
                                                            <Image src={`${attendee.Kids.profile_pic}`} fill={true} alt={`profile picture of ${attendee.Kids.first_name}`} style={{ objectFit: 'cover' }} className='rounded-full ' />
                                                        </div>
                                                        <p>{attendee.Kids.first_name} {attendee.Kids.last_name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </>
                                );
                            case ('maybe'):
                                return (
                                    <>
                                        {maybeResponse?.length === 0
                                            ?
                                            <p>No maybe yet</p>
                                            :
                                            maybeResponse.map((attendee) => {
                                                return (
                                                    <div className='w-full flex justify-start bg-appGold rounded-lg p-2 text-sm mb-2' key={`${attendee.Kids.id}AttendanceButton}`}>
                                                        <div className='w-5 h-5 relative rounded-full mr-4'>
                                                            <Image src={`${attendee.Kids.profile_pic}`} fill={true} alt={`profile picture of ${attendee.Kids.first_name}`} style={{ objectFit: 'cover' }} className='rounded-full ' />
                                                        </div>
                                                        <p>{attendee.Kids.first_name} {attendee.Kids.last_name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </>
                                );
                            case ('invited'):
                                return (
                                    <>
                                        {invitedResponse?.length === 0
                                            ?
                                            <p>No invites left</p>
                                            :
                                            invitedResponse.map((attendee) => {
                                                return (
                                                    <div className='w-full flex justify-start bg-appGold rounded-lg p-2 text-sm mb-2' key={`${attendee.Kids.id}AttendanceButton}`}>
                                                        <div className='w-5 h-5 relative rounded-full mr-4'>
                                                            <Image src={`${attendee.Kids.profile_pic}`} fill={true} alt={`profile picture of ${attendee.Kids.first_name}`} style={{ objectFit: 'cover' }} className='rounded-full ' />
                                                        </div>
                                                        <p>{attendee.Kids.first_name} {attendee.Kids.last_name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </>
                                );
                        }
                    })()
                    }

                </div>

            </section >

            :
            <section id='playdateAttendanceTabs' className='flex flex-col gap-2 items-start rounded-lg justify-start p-4 border-2 border-appBlue m-2'>
                <p>Loading attendance data...</p>
            </section>

    )
}

//try wrapping with suspense instead of ternary for loading attendance data
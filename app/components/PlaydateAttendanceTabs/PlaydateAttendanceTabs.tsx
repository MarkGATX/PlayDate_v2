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
    console.dir(maybeResponse)
    console.dir(invitedResponse)


    return (
        attendanceData
            ?

            <section id='playdateAttendanceTabs' className='flex flex-col gap-2 items-start rounded-lg justify-start p-4 border-2 border-appBlue m-2'>
                < h3 className='font-bold' > Responses:</h3 >
                <div id='tabs' className='flex justify-between w-full gap-1'>
                    <div className={`w-1/5 flex justify-center items-center rounded-xl text-sm text-center cursor-pointer ${selectedTab === 'yes' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-inputBG border-1'}`} onClick={() => handleClick('yes')}>
                        <p>Yes</p>
                    </div>
                    <div className={`w-1/5 flex justify-center items-center rounded-xl text-sm text-center cursor-pointer ${selectedTab === 'no' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBlue border-1 '}`} onClick={() => handleClick('no')}>
                        <p>No</p>
                    </div>
                    <div className={`w-1/5 flex justify-center items-center rounded-xl text-sm text-center cursor-pointer ${selectedTab === 'maybe' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBlue border-1'}`} onClick={() => handleClick('maybe')}>
                        <p>Maybe</p>
                    </div>
                    <div className={`w-1/5 flex justify-center items-center rounded-xl text-sm text-center cursor-pointer ${selectedTab === 'invited' ? 'bg-appGold border-appBlue border-2' : 'bg-inputBG border-appBlue border-1'}`} onClick={() => handleClick('invited')}>
                        <p>Invited</p>
                    </div>
                </div>
                <div id='attendanceLists' className='h-48 w-full'>
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
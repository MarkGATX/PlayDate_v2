import supabaseClient from "@/utils/supabase/client";
import {
  InvitedKidType,
  InviteStatusType,
} from "@/utils/types/playdateTypeDefinitions";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PlaydateAttendanceTabs({
  playdate,
}: {
  playdate: string;
}) {
  const [selectedTab, setSelectedTab] = useState<string>("yes");
  const [yesResponse, setYesResponse] = useState<InviteStatusType[]>([]);
  const [noResponse, setNoResponse] = useState<InviteStatusType[]>([]);
  const [maybeResponse, setMaybeResponse] = useState<InviteStatusType[]>([]);
  const [invitedResponse, setInvitedResponse] = useState<InviteStatusType[]>(
    [],
  );
  const [attendanceData, setAttendanceData] = useState<
    InviteStatusType[] | null
  >(null);

  useEffect(() => {
    const getPlaydateAttendanceData = async () => {
      //using returns to override what supabase expects to receive. They expect an array here but sending an object, so overriding to expect an object
      const {
        data: playdateAttendanceData,
        error: playdateAttendanceDataError,
      } = await supabaseClient
        .from("Playdate_Attendance")
        .select(
          "invite_status, Kids(id,first_name, last_name, profile_pic, first_name_only)",
        )
        .eq("playdate_id", playdate)
        .returns<InviteStatusType[]>();

      if (playdateAttendanceData) {
        setAttendanceData(playdateAttendanceData);
      }
      if (playdateAttendanceData && playdateAttendanceData.length > 0) {
        let rawYesData: InviteStatusType[] = [];
        let rawNoData: InviteStatusType[] = [];
        let rawMaybeData: InviteStatusType[] = [];
        let rawInvitedData: InviteStatusType[] = [];
        playdateAttendanceData.forEach((attendee) => {
          switch (attendee.invite_status) {
            case "accepted":
              rawYesData.push(attendee);
              break;
            case "rejected":
              rawNoData.push(attendee);
              break;
            case "maybe":
              rawMaybeData.push(attendee);
              break;
            case "invited":
              rawInvitedData.push(attendee);
              break;
            default:
              break;
          }
        });
        // Update state in a single operation
        setYesResponse(rawYesData);
        setNoResponse(rawNoData);
        setMaybeResponse(rawMaybeData);
        setInvitedResponse(rawInvitedData);
      }
    };

    getPlaydateAttendanceData();

    const attendanceSubscription = supabaseClient
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Playdate_Attendance",
          filter: `playdate_id=eq.${playdate}`,
        },
        (payload) => {
          getPlaydateAttendanceData();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(attendanceSubscription);
    };
  }, [playdate]);

  const handleClick = async (value: string) => {
    setSelectedTab(value);
  };

  return attendanceData ? (
    <section
      id="playdateAttendanceTabs"
      className="m-2 flex flex-col items-start justify-start gap-2 rounded-lg border-2 border-appBlue p-4"
    >
      <h3 className="font-bold"> Responses:</h3>
      <div id="tabs" className="flex w-full justify-between gap-2">
        <div
          className={`relative flex w-1/4 cursor-pointer items-center justify-center rounded-xl text-center text-xs ${selectedTab === "yes" ? "border-2 border-appBlue bg-appGold" : "border-1 border-appBG bg-inputBG"}`}
          onClick={() => handleClick("yes")}
        >
          {yesResponse.length > 0 ? (
            <>
              <p>Yes</p>
              <div
                className={`absolute -right-2 -top-2 inline-block w-auto min-w-4 rounded-full ${selectedTab === "yes" ? "border-2 border-appBlue bg-appGold" : "border-2 border-appBG bg-inputBG"}`}
              >
                {yesResponse.length}
              </div>
            </>
          ) : (
            <p>Yes</p>
          )}
        </div>

        <div
          className={`relative flex w-1/4 cursor-pointer items-center justify-center rounded-xl text-center text-xs ${selectedTab === "no" ? "border-2 border-appBlue bg-appGold" : "border-1 border-appBG bg-inputBG"}`}
          onClick={() => handleClick("no")}
        >
          {noResponse.length > 0 ? (
            <>
              <p>No</p>
              <div
                className={`absolute -right-2 -top-2 inline-block w-auto min-w-4 rounded-full ${selectedTab === "no" ? "border-2 border-appBlue bg-appGold" : "border-2 border-appBG bg-inputBG"}`}
              >
                {noResponse.length}
              </div>
            </>
          ) : (
            <p>No</p>
          )}
        </div>
        <div
          className={`relative flex w-1/4 cursor-pointer items-center justify-center rounded-xl text-center text-xs ${selectedTab === "maybe" ? "border-2 border-appBlue bg-appGold" : "border-2 border-appBG bg-inputBG"}`}
          onClick={() => handleClick("maybe")}
        >
          {maybeResponse.length > 0 ? (
            <>
              <p>Maybe</p>
              <div
                className={`absolute -right-2 -top-2 inline-block w-auto min-w-4 rounded-full ${selectedTab === "maybe" ? "border-2 border-appBlue bg-appGold" : "border-2 border-appBG bg-inputBG"}`}
              >
                {maybeResponse.length}
              </div>
            </>
          ) : (
            <>
              <p>Maybe</p>
            </>
          )}
        </div>
        <div
          className={`relative flex w-1/4 cursor-pointer items-center justify-center rounded-xl text-center text-xs ${selectedTab === "invited" ? "border-2 border-appBlue bg-appGold" : "border-1 border-appBlue bg-inputBG"}`}
          onClick={() => handleClick("invited")}
        >
          {invitedResponse.length > 0 ? (
            <>
              <p>Invited</p>
              <div
                className={`absolute -right-2 -top-2 inline-block w-auto min-w-4 rounded-full ${selectedTab === "invited" ? "border-2 border-appBlue bg-appGold" : "border-2 border-appBG bg-inputBG"}`}
              >
                {invitedResponse.length}
              </div>
            </>
          ) : (
            <p>Invited</p>
          )}
        </div>
      </div>
      <div
        id="attendanceLists"
        className="h-auto max-h-44 w-full overflow-y-auto"
      >
        {(() => {
          switch (selectedTab) {
            case "yes":
              return (
                <>
                  {yesResponse?.length === 0 ? (
                    <p>No acceptance yet</p>
                  ) : (
                    yesResponse.map((attendee) => {
                      return (
                        <div
                          className="mb-2 flex w-full justify-start rounded-lg bg-appGold p-2 text-sm"
                          key={`${attendee.Kids.id}AttendanceButton}`}
                        >
                          <div className="relative mr-4 h-5 w-5 rounded-full">
                            <Image
                              src={`${attendee.Kids.profile_pic}`}
                              fill={true}
                              alt={`profile picture of ${attendee.Kids.first_name}`}
                              style={{ objectFit: "cover" }}
                              className="rounded-full"
                            />
                          </div>
                          <p>
                            {attendee.Kids.first_name} {attendee.Kids.last_name}
                          </p>
                        </div>
                      );
                    })
                  )}
                </>
              );
            case "no":
              return (
                <>
                  {noResponse?.length === 0 ? (
                    <p>No rejections yet</p>
                  ) : (
                    noResponse.map((attendee) => {
                      return (
                        <div
                          className="mb-2 flex w-full justify-start rounded-lg bg-appGold p-2 text-sm"
                          key={`${attendee.Kids.id}AttendanceButton}`}
                        >
                          <div className="relative mr-4 h-5 w-5 rounded-full">
                            <Image
                              src={`${attendee.Kids.profile_pic}`}
                              fill={true}
                              alt={`profile picture of ${attendee.Kids.first_name}`}
                              style={{ objectFit: "cover" }}
                              className="rounded-full"
                            />
                          </div>
                          <p>
                            {attendee.Kids.first_name} {attendee.Kids.last_name}
                          </p>
                        </div>
                      );
                    })
                  )}
                </>
              );
            case "maybe":
              return (
                <>
                  {maybeResponse?.length === 0 ? (
                    <p>No maybe yet</p>
                  ) : (
                    maybeResponse.map((attendee) => {
                      return (
                        <div
                          className="mb-2 flex w-full justify-start rounded-lg bg-appGold p-2 text-sm"
                          key={`${attendee.Kids.id}AttendanceButton}`}
                        >
                          <div className="relative mr-4 h-5 w-5 rounded-full">
                            <Image
                              src={`${attendee.Kids.profile_pic}`}
                              fill={true}
                              alt={`profile picture of ${attendee.Kids.first_name}`}
                              style={{ objectFit: "cover" }}
                              className="rounded-full"
                            />
                          </div>
                          <p>
                            {attendee.Kids.first_name} {attendee.Kids.last_name}
                          </p>
                        </div>
                      );
                    })
                  )}
                </>
              );
            case "invited":
              return (
                <>
                  {invitedResponse?.length === 0 ? (
                    <p>No invites left</p>
                  ) : (
                    invitedResponse.map((attendee) => {
                      return (
                        <div
                          className="mb-2 flex w-full justify-start rounded-lg bg-appGold p-2 text-sm"
                          key={`${attendee.Kids.id}AttendanceButton}`}
                        >
                          <div className="relative mr-4 h-5 w-5 rounded-full">
                            <Image
                              src={`${attendee.Kids.profile_pic}`}
                              fill={true}
                              alt={`profile picture of ${attendee.Kids.first_name}`}
                              style={{ objectFit: "cover" }}
                              className="rounded-full"
                            />
                          </div>
                          <p>
                            {attendee.Kids.first_name} {attendee.Kids.last_name}
                          </p>
                        </div>
                      );
                    })
                  )}
                </>
              );
          }
        })()}
      </div>
    </section>
  ) : (
    <section
      id="playdateAttendanceTabs"
      className="m-2 flex flex-col items-start justify-start gap-2 rounded-lg border-2 border-appBlue p-4"
    >
      <p>Loading attendance data...</p>
    </section>
  );
}

//try wrapping with suspense instead of ternary for loading attendance data

import {
  acceptPlaydateInvite,
  getKidsPlaydateData,
  maybePlaydateInvite,
  rejectPlaydateInvite,
} from "@/utils/actions/playdateActions";
import supabaseClient from "@/utils/supabase/client";
import {
  PlaydateDashboardListType,
  PlaydateType,
} from "@/utils/types/playdateTypeDefinitions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import PlaydateReminderCard from "../PlaydateReminderCard/PlaydateReminderCard";

export default function DashboardPlaydateSection({
  adultData,
}: {
  adultData: AdultsType;
}) {
  const [playdates, setPlaydates] = useState<PlaydateDashboardListType[]>();
  const upcomingPlaydatesRef = useRef<HTMLDivElement | null>(null);
  const [showPlaydates, setShowPlaydates] = useState<boolean>(false);
  const [kidIds, setKidIds] = useState<string[] | null>(null);
  // const [showStatusChange, setShowStatusChange] = useState<boolean>(false)

  const { contextSafe } = useGSAP();

  const handleShowplaydates = contextSafe(() => {
    if (upcomingPlaydatesRef.current) {
      if (!showPlaydates) {
        gsap.to(upcomingPlaydatesRef.current, {
          height: "auto",
          autoAlpha: 1,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowPlaydates((previousValue) => !previousValue);
        //trying to get element to scroll into view when opened. currently seems to be re-rendering parent and causing visual jump
        // upcomingPlaydatesRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        gsap.to(upcomingPlaydatesRef.current, {
          height: 0,
          autoAlpha: 0,
          ease: "power2.inOut",
          duration: 0.3,
        });
        setShowPlaydates((previousValue) => !previousValue);
      }
    }
  });

  useEffect(() => {
    console.log("test");
    const fetchPlaydates = async () => {
      try {
        const playdates = await getKidsPlaydateData(adultData.id);
        if (playdates && playdates.length > 0) {
          const sortedPlaydates = playdates.sort((a, b) => {
            //convert into date objects
            const dateA = new Date(a.Playdates.time);
            const dateB = new Date(b.Playdates.time);
            //get time in milliseconds from dates and sort based on results
            return dateA.getTime() - dateB.getTime();
          });
          setPlaydates(sortedPlaydates);
        }
      } catch (error) {
        console.error("Error fetching playdates:", error);
      }
    };

    fetchPlaydates();


    const playdatesSubscription = supabaseClient
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Playdate_Attendance",
          //convert array to csv for 'in' filter to work
          filter: `kid_id=in.(${kidIds?.join(",")})`,
        },
        (payload) => {
          fetchPlaydates();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Playdate Subscription successful');
        } else {
          console.error('Playdate Subscription failed:', status);
        }
      });
    


    const deletedPlaydatesSubscription = supabaseClient
      .channel("deleted_playdates_subscription")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Playdates",
          //convert array to csv for 'in' filter to work
          filter: `host_kid_id=in.(${kidIds?.join(",")})`,
        },
        (payload) => {
          fetchPlaydates();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Deleted Playdates Subscription successful');
        } else {
          console.error('Delated Playdates Subscription failed:', status);
        }
      });


    return () => {
      supabaseClient.removeChannel(playdatesSubscription);
      supabaseClient.removeChannel(deletedPlaydatesSubscription);
    };
  }, [adultData, kidIds]);

  useEffect(() => {
    const fetchKidsIds = async () => {
      try {
        const { data: kidsIdData, error: kidsIdDataError } =
          await supabaseClient
            .from("Adult_Kid")
            .select("kid_id") // Select only the ID for efficiency
            .eq("adult_id", adultData.id);
        if (kidsIdDataError) {
          throw kidsIdDataError;
        }
        //map the resulting array of objects into an array of ids
        const kidsIds = kidsIdData.map((kid: { kid_id: string }) => kid.kid_id);
        setKidIds(kidsIds);
      } catch (error) {
        console.error("Error fetching playdates:", error);
      }
    };

    fetchKidsIds();
  }, [adultData]);

  return (
    <section
      id="currentPlaydates"
      className="mb-4 flex w-full flex-col items-center justify-center gap-2"
    >
      <Suspense
        fallback={
          <div className="align-center flex w-full items-center justify-start bg-appBlue px-4 text-appBG">
            Loading with suspense...
          </div>
        }
      >
        <div className="align-center flex w-full items-center justify-start bg-appBlue px-4 text-appBG xl:rounded-l-md ">
          <div
            className="transform cursor-pointer rounded-md bg-appGold p-2 duration-300 ease-in-out hover:scale-125"
            onClick={handleShowplaydates}
          >
            <Image
              src={`/icons/down_arrow.webp`}
              width={15}
              height={16}
              alt="down icon to show more details"
              title="more details"
              className={`transform duration-700 ease-in-out ${showPlaydates ? "-rotate-180" : "rotate-0"} `}
            ></Image>
          </div>
          <h2 className="p-4 text-left font-bold">Upcoming Playdates</h2>
        </div>
        <div
          id="upcomingPlaydates"
          ref={upcomingPlaydatesRef}
          className="flex h-0 flex-col items-center gap-2 overflow-y-hidden px-4 pt-2 opacity-0"
        >
          {playdates ? (
            <>
              {playdates.map((playdate, index) => {
                return (
                  <PlaydateReminderCard
                    key={`${playdate.playdate_id}${playdate.kid_id}`}
                    playdate={playdate}
                    index={index}
                  />
                );
              })}
            </>
          ) : (
            <div>No playdates</div>
          )}
        </div>
      </Suspense>
    </section>
  );
}

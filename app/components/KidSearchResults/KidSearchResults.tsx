import { searchForKids } from "@/utils/actions/searchActions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import KidSearchCard from "../KidSearchCard/KidSearchCard";
import { useGSAP } from "@gsap/react";


export default function KidSearchResults({ searchType, searchTerm, currentUser }: { searchType: string, searchTerm: string, currentUser: AdultsType }) {

    const [searchResults, setSearchResults] = useState<KidsType[]>([]);
    const [leftButtonEnd, setLeftButtonEnd] = useState<boolean>(true)
    const [rightButtonEnd, setRightButtonEnd] = useState<boolean>(false)
    const kidSearchResultsRef = useRef<HTMLElement | null>(null)
    const kidSearchResultsCardsRef = useRef<HTMLElement | null>(null)
    const scrollerButtonDivRef = useRef<HTMLDivElement>(null)
    const scrollRightButtonRef = useRef<SVGSVGElement>(null)
    const scrollLeftButtonRef = useRef<SVGSVGElement>(null)

    const { contextSafe } = useGSAP();

    // let scrollInterval:any;

    // const handleScrollLeft = () =>  {
    //     if(kidSearchResultsCardsRef.current) {
    //     const scroll = kidSearchResultsCardsRef.current;
    //     scroll.scrollLeft += 100
    //     console.log(scroll.scrollLeft)
    //     }
    //     // scrollInterval = setInterval(() => {
    //         // gsap.to(scroll, { scrollLeft: '+=100' })
    //     // }, 10);
    //     // scrollInterval()
    // }

    // const handleScrollRight = contextSafe(() => {
    //     const scroll = kidSearchResultsCardsRef.current
    //     console.log(scroll?.scrollLeft)
    //     // scrollInterval = setInterval(() => {
    //         gsap.to(scroll, { scrollLeft: '-=100' })
    //     // }, 10);
    //     // scrollInterval();

    // });

    // const handlePointerUp = contextSafe(() => {
    //     if (kidSearchResultsCardsRef.current) {
    //         const scroll = kidSearchResultsCardsRef.current

    //         if (scroll.scrollLeft === 0) {
    //             setLeftButtonEnd(true)
    //             setRightButtonEnd(false)
    //         }
    //         if (scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 1) {
    //             setRightButtonEnd(true)
    //             setLeftButtonEnd(false)
    //         }
    //         if (scroll.scrollLeft !== 0 && scroll.scrollLeft + scroll.clientWidth < scroll.scrollWidth - 1) {
    //             setLeftButtonEnd(false);
    //             setRightButtonEnd(false)
    //         }

    //         // clearInterval(scrollInterval);
    //     }
    // })



    //memoize function outside of useEffect to break re-render loops on searhResults dependency
    // const memoizedKidSearchResults = useMemo(() => async () => {
    useEffect(() => {
        const fetchKidSearchResults = async() => {
        const kidResultArray =  await searchForKids({ searchTerm })
            if (searchTerm && kidResultArray && kidResultArray.length > 0) {
                console.log('show results')
                setSearchResults(previousValue => kidResultArray);
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '350px',
                        height: '350px',
                        duration: .5,
                        ease: 'power1.inOut',
                    }
                )
                console.log(kidResultArray)
            } else if (searchTerm && kidResultArray && kidResultArray.length === 0) {
                setSearchResults(previousValue => kidResultArray);
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '350px',
                        height: '350px',
                        duration: .5,
                        ease: 'power1.inOut',
                    }
                )
            } else {
                // Handle the case where data is not available (e.g., set an empty array or loading state)
                setSearchResults([]); // Set an empty array or display a loading message
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 0,
                        maxHeight: '350px',
                        height: 0,
                        duration: .5,
                        ease: 'power1.inOut',
                    }
                )
            }
        }
        fetchKidSearchResults();
    }, [searchTerm])

    // useEffect(() => {
    //     memoizedKidSearchResults()
    // }, [searchTerm])

    return (
        <>
            <section id='kidSearchResultsContainer' ref={kidSearchResultsRef} className={`max-h-0 h-0 opacity-0 relative w-full overflow-hidden my-2 border-2 border-appBlue rounded-lg py-1 flex gap-4 flex-col bg-inputBG`}>
                <section id='kidSearchResultsCards' ref={kidSearchResultsCardsRef}>

                    <div id='kidCards' className='w-full flex gap-2 overflow-x-scroll'>
                        {searchTerm && searchResults.length === 0
                            ?
                            <div className='p-2'>{`Sorry, we can't find that kid.`}</div>
                            :
                            searchTerm && searchResults.length > 0
                                ?
                                searchResults.map((kid) => {
                                    return (
                                        kid.primary_caregiver === currentUser.id
                                            ?
                                            null
                                            :
                                            <KidSearchCard key={kid.id} searchType={searchType} currentUserId={currentUser.id} kidData={kid} />
                                    )
                                })

                                :
                                null

                        }
                    </div>


                    {/* {searchResults
                ?
                searchResults.map((kid) => {
                    return (
                        <KidSearchCard key={kid.id} searchType={searchType} currentUserId={currentUser.id} kidData={kid} />
                    )
                })

                // < div className='h-32 border-2 rounded border-appBlue ml-4 w-32'>test</>
                :
                null
            } */}


                </section >
                {/* {
                    searchResults.length > 1
                        ?
                        <div id='scrollButtons' ref={scrollerButtonDivRef} className='w-full flex justify-around'>
                            <svg ref={scrollRightButtonRef} onPointerDown={handleScrollLeft} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} className='' width='36' height='36' version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                viewBox="0 0 48 48" >
                                <g>
                                    <circle cx="24" cy="24" r="21.5" />
                                </g>
                                <polyline points="32.8,13.2 11.4,24 32.8,34.8 " />
                            </svg>
                            <svg ref={scrollLeftButtonRef} onPointerDown={handleScrollRight} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} className='' width='36' height='36' version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                viewBox="0 0 48 48" >
                                <g>
                                    <circle cx="24" cy="24" r="21.5" />
                                </g>
                                <polyline points="14.6,13.2 36,24 14.6,34.8 " />
                            </svg>

                        </div>
                        :
                        null
                } */}
            </section>
        </>
    )
}
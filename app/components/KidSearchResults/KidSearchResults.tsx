import { searchForKids } from "@/utils/actions/searchActions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import KidSearchCard from "../KidSearchCard/KidSearchCard";

export default function KidSearchResults({ searchType, searchTerm, currentUser }: { searchType: string, searchTerm: string, currentUser: AdultsType }) {
    const [searchResults, setSearchResults] = useState<KidsType[]>([]);
    const kidSearchResultsRef = useRef<HTMLElement | null>(null)
    const scrollerButtonDivRef = useRef()
    const scrollRightButtonRef = useRef()
    const scrollLeftButtonRef = useRef()

    useEffect(() => {
        const kidSearchResults = async () => {
            // if (!searchTerm || searchTerm === "") {
            //     gsap.to(kidSearchResultsRef.current,
            //         {
            //             autoAlpha: 0,
            //             maxHeight: 0,
            //             height: 0,
            //             duration: 1,
            //             ease: 'power1.inOut',
            //         }
            //     )
            // }
            const kidResultArray = await searchForKids({ searchTerm })
            if (searchTerm && kidResultArray && kidResultArray.length > 0) {
                console.log('show results')
                setSearchResults(kidResultArray);
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
                setSearchResults(kidResultArray);
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
                console.log(searchResults)
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

        kidSearchResults()
    }, [searchTerm])



    return (
        <section id='kidSearchResults' ref={kidSearchResultsRef} className={`max-h-0 h-0 opacity-0 relative w-full overflow-hidden my-2 border-2 border-appBlue rounded-lg py-1 flex gap-2 overflow-x-scroll bg-inputBG`}>

            <div id='kidSearchResultCards' className='w-full flex gap-2'>
                {/* <Image src='/pics/test_playground.webp' fill={true} style={{ objectFit: 'cover' }} alt='background image of an empty playground' className='-z-10 opacity-20 sticky left-0'></Image> */}
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
            
            {/* {searchResults.length > 1
                ?
                <div ref={scrollerButtonDivRef} className={styles.scrollerButtons}>
                        <svg ref={scrollRightButtonRef} onPointerDown={handleScrollRight} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} className={leftButtonEnd === true ? styles.disabled : styles.on} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                            viewBox="0 0 48 48" >
                            <g>
                                <circle cx="24" cy="24" r="21.5" />
                            </g>
                            <polyline points="32.8,13.2 11.4,24 32.8,34.8 " />
                        </svg>
                        <svg ref={scrollLeftButtonRef} onPointerDown={handleScrollLeft} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} className={rightButtonEnd === true ? styles.disabled : styles.on} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                            viewBox="0 0 48 48" >
                            <g>
                                <circle cx="24" cy="24" r="21.5" />
                            </g>
                            <polyline points="14.6,13.2 36,24 14.6,34.8 " />
                        </svg>

                    </div>
                :
                null} */}
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
    )
}
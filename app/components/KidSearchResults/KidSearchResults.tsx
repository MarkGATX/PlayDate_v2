import { searchForKids } from "@/utils/actions/searchActions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import KidSearchCard from "../KidSearchCard/KidSearchCard";

export default function KidSearchResults({ searchType, searchTerm, currentUser }: { searchType: string, searchTerm: string, currentUser: AdultsType }) {
    const [searchResults, setSearchResults] = useState<KidsType[]>([]);
    const kidSearchResultsRef = useRef<HTMLElement | null>(null)

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
            if (kidResultArray && kidResultArray.length > 0) {
                console.log('show results')
                setSearchResults(kidResultArray);
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '280px',
                        height:'280px',
                        duration: 1,
                        ease: 'power1.inOut',
                    }
                )
                console.log(kidResultArray)
            } else {
                // Handle the case where data is not available (e.g., set an empty array or loading state)
                setSearchResults([]); // Set an empty array or display a loading message
                console.log(searchResults)
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 0,
                        maxHeight: '280px',
                        height: 0,
                        duration: 1,
                        ease: 'power1.inOut',
                    }
                )
            }
        }

        kidSearchResults()
    }, [searchTerm])

    return (
        <section id='kidSearchResults' ref={kidSearchResultsRef} className='max-h-0 h-0 opacity-0 relative w-full overflow-hidden my-2 border-2 border-appBlue rounded-lg py-1 flex gap-2'>

            <Image src='/pics/test_playground.webp' fill={true} style={{ objectFit: 'cover' }} alt='background image of an empty playground' className='-z-10 opacity-20 '></Image>
            {/* {searchTerm && searchResults.length === 0
                ?
                <div className='p-2'>{`Sorry, we can't find that kid.`}</div>
                :
                null
            } */}
            {searchResults
                ?
                searchResults.map((kid) => {
                    return (
                        <KidSearchCard key={kid.id} searchType={searchType} currentUserId={currentUser.id} kidData={kid} />
                    )
                })

                // < div className='h-32 border-2 rounded border-appBlue ml-4 w-32'>test</>
                :
                null
            }
        </section >
    )
}
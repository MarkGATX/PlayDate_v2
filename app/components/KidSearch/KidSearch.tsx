import { searchForKids } from "@/utils/actions/searchActions";
import { KidsType } from "@/utils/types/userTypeDefinitions";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function KidSearchResults({ searchType, searchTerm }: { searchType: string, searchTerm: string }) {
    const [searchResults, setSearchResults] = useState<KidsType[]>([]);
    const kidSearchResultsRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const kidSearchResults = async () => {
            const kidResultArray = await searchForKids({ searchTerm })
            if (kidResultArray && kidResultArray.length > 0) {
                setSearchResults(kidResultArray);
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 1,
                        maxHeight: '200px',
                        duration: 1,
                        ease: 'power1.inOut',
                    }
                )
            } else {
                // Handle the case where data is not available (e.g., set an empty array or loading state)
                setSearchResults([]); // Set an empty array or display a loading message
                gsap.to(kidSearchResultsRef.current,
                    {
                        autoAlpha: 0,
                        maxHeight: 0,
                        duration: 1,
                        ease: 'power1.inOut',
                    }
                )
            }
        }

        kidSearchResults()
    }, [searchTerm])

    return (
        <section id='kidSearchResults' ref={kidSearchResultsRef} className='max-h-0 opacity-0 relative w-full overflow-hidden my-2 border-2 border-appBlue rounded-lg py-1'>

            <Image src='/pics/test_playground.webp' fill={true} style={{ objectFit: 'cover' }} alt='background image of an empty playground' className='-z-10 opacity-20'></Image>
            {searchResults
                ?
                // searchResults.map((kid) => {
                //     return (
                //     <KidSearchResults key={kid.id} kidData={kid} />
                //     )
                // })

                <div className='h-32 border-2 rounded border-appBlue ml-4 w-32'>test</div>
                :
                null
            }
                </section >
    )
}
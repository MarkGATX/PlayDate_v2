import { placesDataType } from "@/utils/map/googlePlacesAPI";
import Image from "next/image";
import { useState } from "react";

type PlaceCardsProps = {
    place: placesDataType;
};

const PlaceCards: React.FC<PlaceCardsProps> = ({ place }) => {
    const [showMore, setShowMore] = useState<boolean>(false)

    return (
        <div className='min-h-28 w-9/12 mb-4 rounded-xl border-2 border-darkBlue overflow-hidden flex flex-col justify-between'>
            <section id='placeCardDetails' className='w-full p-2'>
                <h2 className='text-left w-full'>{place.displayName.text}</h2>
                <div id='starRatings'>{place.rating}</div>
            </section>
            <section id='placeCardMoreInfo' className='w-full flex flex-col justify-center items-center min-h-12 border-t-2 border-darkBlue bg-gold'>
                <div id='moreToggleContainer' className='w-full h-4 flex justify-center items-center ' onClick={(() => setShowMore(!showMore))}>
                    <Image src={`/icons/down_arrow.webp`} width={15} height={16} alt='down icon to show more details' title='more details' className={`transform ease-in-out duration-700 ${showMore ? '-rotate-180' : 'rotate-0'} `}></Image>
                </div>
                <section id='morePlacesDetails' className={`w-100  mt-2 p-1 overflow-y-hidden transition-all ease-in-out duration-700 ${showMore ? 'opacity-100 h-20 ' : 'opacity-0 h-0'}`}
                                    >Show me more</section>
            </section>
        </div>
    )
}

export default PlaceCards;
import { placesDataType } from "@/utils/map/googlePlacesAPI";

type PlaceCardsProps = {
    place: placesDataType;
};

const PlaceCards: React.FC<PlaceCardsProps> = ({ place }) => {
    return (
        <div className='h-28 w-9/12 mb-4 rounded-xl border-2 p-2 overflow-hidden'>
            <h2 className='text-left'>{place.displayName.text}</h2>
        </div>
    )
}

export default PlaceCards;
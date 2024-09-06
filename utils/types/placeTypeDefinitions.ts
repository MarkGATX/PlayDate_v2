import { Delta } from "quill/core"
import { AmenityType } from "../map/amenityList"
import { AdultsType } from "./userTypeDefinitions"

export type locationType = {
    latitude: number
    longitude: number
}

export type displayNameType = {
    text: string
}

export type currentOpeningHoursType = {
    openNow: boolean
    weekdayDescriptions: string[]
}


export type editorialSummaryType = {
    text: string
    languageCode: string
}

export type authorAttributionType = {
    displayName: string
    photoUri: string
    uri: string
}

export type PhotosArrayType = {
    heightPx: number
    name: string
    widthPx: number
    authorAttributions: authorAttributionType[]
}

export type placesDataType = {
    id: string;
    displayName: displayNameType;
    internationalPhoneNumber: string;
    formattedAddress: string;
    location: locationType;
    photos: PhotosArrayType[];
    businessStatus: string;
    currentOpeningHours: currentOpeningHoursType;
    goodForChildren: boolean;
    editorialSummary: editorialSummaryType;
    rating: number;
    iconMaskBaseUri: string;
    iconBackgroundColor: string;
    name: string
}

export type DataType = {
    places: placesDataType[]
    // pageToken:string
}

export type placesDataTypeWithExpiry = {
    places: placesDataType[]
    expiryDate: number

}


//need to improve the definition so if amenityList.ts changes the type here will change as well
export type placeReviewType = {
    created_at:Date;
    id: string;
    reviewer_notes?: Delta;
    reviewer_notes_plain_text?:string;
    google_place_id: string;
    reviewer_id: string;
    stars: number;
    restrooms: boolean
    pool: boolean
    splash_pad: boolean
    wading_pool: boolean
    food: boolean
    basketball: boolean
    tennis: boolean
    soccer: boolean
    picnic_tables: boolean
    toddler_swings: boolean
    hiking: boolean
    pickle_ball: boolean
    softball: boolean
    baseball: boolean
    shady:boolean
    playscape:boolean
    Adults:AdultsType

}

export type AmenityReview = {
    restrooms: boolean;
    pool: boolean;
    splash_pad: boolean;
    wading_pool: boolean;
    food: boolean;
    basketball: boolean;
    tennis: boolean;
    soccer: boolean;
    picnic_tables: boolean;
    toddler_swings: boolean;
    hiking: boolean;
    pickle_ball: boolean;
    softball: boolean;
    baseball: boolean;
    shady:boolean;
    playscape:boolean;
  };

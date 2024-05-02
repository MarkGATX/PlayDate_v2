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
    displayName:string
    photoUri: string
    uri: string
}

export type PhotosArrayType = {
    heightPx:number
    name:string
    widthPx:number
    authorAttributions:authorAttributionType[]
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
    name:string
}

export type DataType = {
    places: placesDataType[]
    // pageToken:string
}

export type placesDataTypeWithExpiry = {
    places:placesDataType[]
    expiryDate:number

}
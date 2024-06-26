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

// <div id='placePicContainer' className='flex h-[250px] relative'>
//                     {currentPlace && currentPlace.photos && currentPlace.photos.length > 0
//                         ?
//                         <Swiper pagination={true} effect={'fade'} navigation={true} modules={[Pagination, Navigation, EffectFade]} >
//                             {currentPlace.photos?.map((photo, index) => (
//                                 <SwiperSlide key={`${currentPlace?.id}photo${index}`}>
//                                     <Image src={`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&maxWidthPx=300&maxHeightPx=300`} alt={`pic ${index + 1} of ${currentPlace?.displayName.text}`} fill={true} style={{ objectFit: 'cover' }}></Image>
//                                     {photo.authorAttributions[0].displayName
//                                         ?
//                                         <a href={`${photo.authorAttributions[0].uri}`} target="_blank"><p className='z-10 absolute text-appGold text-xs pl-2 pt-2'>Image by {photo.authorAttributions[0].displayName}</p></a>
//                                         :
//                                         null
//                                     }
//                                 </SwiperSlide>
//                             ))}
//                         </Swiper>
//                         :
//                         <Image src="/logos/playdate_logo.webp" alt='Playdate logo' fill={true} style={{ objectFit: 'contain' }}></Image>
//                     }

//                 </div>
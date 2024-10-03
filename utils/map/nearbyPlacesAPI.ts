const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;
const radius = 4000; // Radius in meters

import { DataType } from "../types/placeTypeDefinitions";

export async function fetchNearbyPlaces(
  types: string[],
  latitude: number,
  longitude: number,
  pageToken?: string,
) {
  const baseUrl = "https://places.googleapis.com/v1/places:searchNearby";

  const dataOptions = {
    includedPrimaryTypes: types,
    maxResultCount: 20,
    // rankPreference: 'DISTANCE',
    locationRestriction: {
      circle: {
        center: {
          latitude: latitude,
          longitude: longitude,
        },
        radius: radius,
      },
    },
    pageToken: pageToken,
  };

  if (!mapsApiKey) {
    throw new Error("Google Places API key is not set");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": mapsApiKey,
      // 'X-Goog-FieldMask': '*', // Field to retrieve (optional)
      "X-Goog-FieldMask":
        "places.id,places.displayName.text,places.internationalPhoneNumber,places.formattedAddress,places.location,places.businessStatus,places.currentOpeningHours,places.goodForChildren,places.editorialSummary,places.rating,places.iconMaskBaseUri,places.iconBackgroundColor,places.primaryType,places.photos",
    },
    body: JSON.stringify(dataOptions),
  };

  try {
    const response = await fetch(baseUrl, options);
    if (!response.ok) {
      throw new Error(`Error fetching nearby locations: ${response.status}`);
    }
    const data: DataType = await response.json();

    if (!data) {
      console.error("No data received from API");
      return;
    }
    data.places = data.places.filter(
      (place) =>
        place.businessStatus != "CLOSED" &&
        place.businessStatus != "CLOSED_TEMPORARILY",
    );

    // shuffle results for random display
    for (let i = data.places.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data.places[i], data.places[j]] = [data.places[j], data.places[i]];
    }
    const dataWithExpiry = {
      places: data.places,
      expiryDate: new Date().getTime() + 60 * 60 * 1000,
    };
    //handle page token for pagination
    // const mapPageToken = data.pageToken;
    localStorage.setItem("placesData", JSON.stringify(dataWithExpiry));
    return data.places;
  } catch (error) {
    console.error("Error fetching nearby places:", error);
  }
}

/*
{
    "name": "places/ChIJC9b8dLq1RIYR2azmxdwJMA0",
    "id": "ChIJC9b8dLq1RIYR2azmxdwJMA0",
    "types": [
        "book_store",
        "store",
        "point_of_interest",
        "establishment"
    ],
    "nationalPhoneNumber": "(361) 423-0335",
    "internationalPhoneNumber": "+1 361-423-0335",
    "formattedAddress": "2501 S I-35 Frontage Rd, Austin, TX 78741, USA",
    "addressComponents": [
        {
            "longText": "2501",
            "shortText": "2501",
            "types": [
                "street_number"
            ],
            "languageCode": "en-US"
        },
        {
            "longText": "South Interstate 35 Frontage Road",
            "shortText": "S I-35 Frontage Rd",
            "types": [
                "route"
            ],
            "languageCode": "en"
        },
        {
            "longText": "East Riverside - Oltorf",
            "shortText": "East Riverside - Oltorf",
            "types": [
                "neighborhood",
                "political"
            ],
            "languageCode": "en"
        },
        {
            "longText": "Austin",
            "shortText": "Austin",
            "types": [
                "locality",
                "political"
            ],
            "languageCode": "en"
        },
        {
            "longText": "Travis County",
            "shortText": "Travis County",
            "types": [
                "administrative_area_level_2",
                "political"
            ],
            "languageCode": "en"
        },
        {
            "longText": "Texas",
            "shortText": "TX",
            "types": [
                "administrative_area_level_1",
                "political"
            ],
            "languageCode": "en"
        },
        {
            "longText": "United States",
            "shortText": "US",
            "types": [
                "country",
                "political"
            ],
            "languageCode": "en"
        },
        {
            "longText": "78741",
            "shortText": "78741",
            "types": [
                "postal_code"
            ],
            "languageCode": "en-US"
        },
        {
            "longText": "5533",
            "shortText": "5533",
            "types": [
                "postal_code_suffix"
            ],
            "languageCode": "en-US"
        }
    ],
    "plusCode": {
        "globalCode": "862467J5+JG",
        "compoundCode": "67J5+JG Austin, TX, USA"
    },
    "location": {
        "latitude": 30.231510500000002,
        "longitude": -97.7411297
    },
    "viewport": {
        "low": {
            "latitude": 30.230131119708503,
            "longitude": -97.7424150302915
        },
        "high": {
            "latitude": 30.2328290802915,
            "longitude": -97.73971706970849
        }
    },
    "googleMapsUri": "https://maps.google.com/?cid=950270365192858841",
    "utcOffsetMinutes": -300,
    "adrFormatAddress": "<span class=\"street-address\">2501 S I-35 Frontage Rd</span>, <span class=\"locality\">Austin</span>, <span class=\"region\">TX</span> <span class=\"postal-code\">78741-5533</span>, <span class=\"country-name\">USA</span>",
    "businessStatus": "CLOSED_TEMPORARILY",
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
    "iconBackgroundColor": "#4B96F3",
    "displayName": {
        "text": "STYLEMOYEN",
        "languageCode": "en"
    },
    "primaryTypeDisplayName": {
        "text": "Book Store",
        "languageCode": "en-US"
    },
    "primaryType": "book_store",
    "shortFormattedAddress": "2501 S I-35 Frontage Rd, Austin"
}
*/

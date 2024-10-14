"use client";
import { LocationContext } from "@/utils/location/LocationContext";
import { fetchNearbyPlaces } from "@/utils/map/nearbyPlacesAPI";
import {
  placesDataTypeWithExpiry,
  placesDataType,
} from "@/utils/types/placeTypeDefinitions";
import { WeatherContext } from "@/utils/weather/WeatherContext";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useContext, useEffect, useRef, useState } from "react";
import { goodWeatherCodes } from "@/utils/map/activityTypes";
import { goodWeatherActivity } from "@/utils/map/activityTypes";
import { badWeatherActivity } from "@/utils/map/activityTypes";
import PlaceCards from "../PlaceCards/PlaceCards";
import { AuthContext } from "@/utils/firebase/AuthContext";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import supabaseClient from "@/utils/supabase/client";
import { fetchSearchedPlace } from "@/utils/actions/searchActions";

export default function MapContainer() {
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AdultsType>();
  const [places, setPlaces] = useState<placesDataType[] | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const currentLocation = useContext(LocationContext);
  const currentWeather = useContext(WeatherContext);
  const { user } = useContext(AuthContext);
  const searchTermRef = useRef<HTMLInputElement>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  // const [isPlacesLibLoaded, setIsPlacesLibLoaded] = useState(false);
  // const map = useMap();
  // const placesLibrary = useMapsLibrary('places');

  // useEffect(() => {
  //     if (!placesLibrary || !map) return;

  //     // when placesLibrary is loaded, the library can be accessed via the
  //     // placesLibrary API object
  //     setPlacesService(new placesLibrary.PlacesService(map));
  //   }, [placesLibrary, map]);

  useEffect(() => {
    const getCurrentUser = async () => {
      // getCachedUser()
      try {
        const firebase_uid = user?.uid;
        if (!firebase_uid) {
          return;
        }
        const { data: adultData, error: adultError } = await supabaseClient
          .from("Adults")
          .select("*") // Select only the ID for efficiency
          .eq("firebase_uid", firebase_uid);
        if (adultError) {
          throw adultError;
        }
        if (adultData) {
          setCurrentUser(adultData[0]);
          // get kids associated with adult
          //COMBINE INTO ONE QUERY, SELECT('KID_ID, KIDS(FIRST_NAME, LAST_NAME, ID)')
          const { data: kidsJoinData, error: kidsJoinDataError } =
            await supabaseClient
              .from("Adult_Kid")
              .select("kid_id")
              .eq("adult_id", adultData[0].id);

          if (kidsJoinDataError) {
            throw kidsJoinDataError;
          }
          if (kidsJoinData) {
            //map kidsJoinData into array to use .in method
            const kidIds = kidsJoinData.map((kidJoin) => kidJoin.kid_id);
            const { data: kidsData, error: kidsDataError } =
              await supabaseClient
                .from("Kids")
                .select("first_name, last_name, id")
                .in("id", kidIds);
            if (kidsDataError) {
              throw kidsDataError;
            }
            if (kidsData) {
              setCurrentUser({
                ...adultData[0],
                Kids: kidsData,
              });
            }
          }

          // }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getPlaces = async () => {
      try {
        const activityTypes = goodWeatherCodes.includes(
          currentWeather.weatherData?.current_icon || 0,
        )
          ? goodWeatherActivity
          : badWeatherActivity;
        // check for accurate types. placesDataTypeWithExpiry doesn't work
        let placesData;
        const storedPlacesData = localStorage.getItem("placesData");
        if (storedPlacesData) {
          // Get the data from local storage
          placesData = JSON.parse(storedPlacesData);
          //check expiry date to make sure data is still relevant. refetch if expired
          if (placesData.expiryDate > Date.now()) {
            setPlaces(placesData.places);
          } else {
            localStorage.removeItem("placesData");
            // Store the places in local storage. handled in fetchNearbyPlaces
            placesData = await fetchNearbyPlaces(
              activityTypes,
              currentLocation.latitude,
              currentLocation.longitude,
            );

            setPlaces(placesData);
          }
        } else {
          //get the data from Google Places
          placesData = await fetchNearbyPlaces(
            activityTypes,
            currentLocation.latitude,
            currentLocation.longitude,
          );
          // Store the places in local storage, handled in fetchNearbyPlaces
          setPlaces(placesData);
        }
      } catch (error: any) {
        setError(error);
      }
    };
    getPlaces();
    getCurrentUser();
  }, [currentLocation, currentWeather, user]);

  if (error) {
    return <div> There was an error getting your map data: {error}</div>;
  }

  function normalizePlaceData(place: any): placesDataType {
    return {
      id: place.id || place.place_id,
      displayName: {
        text: place.displayName?.text || place.name || "",
      },
      internationalPhoneNumber:
        place.internationalPhoneNumber || place.formatted_phone_number || "",
      formattedAddress: place.formattedAddress || place.formatted_address || "",
      location: {
        latitude:
          place.location?.latitude || place.geometry?.location?.lat || 0,
        longitude:
          place.location?.longitude || place.geometry?.location?.lng || 0,
      },
      photos: (place.photos || []).map((photo: any) => ({
        heightPx: photo.heightPx || photo.height,
        name: photo.name || "",
        widthPx: photo.widthPx || photo.width,
        authorAttributions: (photo.authorAttributions || []).map(
          (attr: any) => ({
            displayName: attr.displayName || "",
            photoUri: attr.photoUri || "",
            uri: attr.uri || "",
          }),
        ),
      })),
      businessStatus: place.businessStatus || "",
      currentOpeningHours: {
        openNow:
          place.currentOpeningHours?.openNow ||
          place.opening_hours?.open_now ||
          false,
        weekdayDescriptions:
          place.currentOpeningHours?.weekdayDescriptions ||
          place.opening_hours?.weekday_text ||
          [],
      },
      goodForChildren: place.goodForChildren || false,
      editorialSummary: {
        text: place.editorialSummary?.text || "",
        languageCode: place.editorialSummary?.languageCode || "en",
      },
      rating: place.rating || 0,
      iconMaskBaseUri: place.iconMaskBaseUri || "",
      iconBackgroundColor: place.iconBackgroundColor || "",
      name: place.name || place.displayName?.text || "",
    };
  }

  const handlePlaceSearch = async () => {
    if (!searchTermRef.current) {
      return;
    }
    const searchedPlace = await fetchSearchedPlace(searchTermRef.current.value, currentLocation.latitude, currentLocation.longitude);
    //normalize the data to match the same format returned from the maps api
    console.log(searchedPlace);
    const normalizedResults = searchedPlace.results.map(normalizePlaceData);
    console.log(normalizedResults);
    //set places to place markers on map and update place cards
    setPlaces(normalizedResults);
  };

  console.log(places);
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API &&
    currentLocation.latitude != 0 &&
    currentLocation.longitude != 0 ? (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}
      libraries={["places"]}
    >
      {/* <div>{currentLocation.latitude} {currentLocation.longitude}</div> */}
      <Map
        style={{ width: "100vw", height: "40dvh", marginBottom: "2rem" }}
        defaultCenter={{
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        }}
        defaultZoom={12}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAIN_MAP_ID}
      >
        {places
          ? places
              .slice((currentPage - 1) * 5, currentPage * 5)
              .map((place) => {
                return (
                  <AdvancedMarker
                    key={place.id}
                    position={{
                      lat: place.location.latitude,
                      lng: place.location.longitude,
                    }}
                    title={place.displayName.text}
                    onClick={() =>
                      document
                        .getElementById(place.id)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <div
                      className={`markerPin z-10 max-w-32 cursor-pointer rounded bg-appBlue p-1 text-appGold`}
                    >
                      <h3>
                        {place.displayName.text.length >= 30
                          ? `${place.displayName.text.slice(0, 30)}...`
                          : place.displayName.text}
                      </h3>
                    </div>
                  </AdvancedMarker>
                );
              })
          : null}
      </Map>
      <div className="mb-8 flex w-full flex-col items-center justify-center">
        <input
          type="text"
          ref={searchTermRef}
          className="mb-4 w-5/6 rounded-lg border-2 border-appBlue p-2"
          placeholder="Search for nearby places..."
        ></input>
        <button
          className="w-[130px] transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-4 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
          onClick={handlePlaceSearch}
        >
          Search
        </button>
      </div>
      {places ? (
        <>
          <p className="mb-8 w-full bg-appBlue p-4 text-lg font-bold text-appBG">
            Suggestions...
          </p>

          <div
            id="paginationButtons"
            className="mb-12 flex w-full justify-around"
          >
            <button
              className="w-[130px] transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-4 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {currentPage === 1 ? "Start" : "Previous 5"}
            </button>
            <button
              className="w-[130px] transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-4 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 5 >= places.length}
            >
              {currentPage * 5 >= places.length ? "End of list" : "Next 5"}
            </button>
          </div>
          {places.slice((currentPage - 1) * 5, currentPage * 5).map((place) => (
            <PlaceCards
              place={place}
              key={place.id}
              kids={currentUser?.Kids}
              currentUserID={currentUser?.id}
            />
          ))}
        </>
      ) : null}
    </APIProvider>
  ) : (
    <div>Loading map data...</div>
  );
}

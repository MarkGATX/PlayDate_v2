export async function getActivitiesFromWeather(latitude: number, longitude: number, weatherCode: number | undefined) {

    const goodWeatherCodes: number[] = [800, 801, 802, 803, 804, 741];
    const goodWeatherSearches: string[] = ['playground%20', 'hike%20', 'lake%20', 'zoo%20', 'ice%20cream%20', 'ice%20cream%20parlor%20', 'state%20park%20', 'play']
    const badWeatherSearches: string[] = ['museum%20', 'movie%20', 'library%20', 'craft%20', 'theater%20', 'aquarium']
    let activityFetchUrls: string[] = []
    const minLatitude: number = latitude - .5;
    const maxLatitude: number = latitude + .5;
    const minLongitude: number = longitude - .5;
    const maxLongitude: number = longitude + .5;

  
    if (weatherCode) {
        if (goodWeatherCodes.includes(weatherCode)) {
            //get unique random numbers
            let goodWeatherIndexArray: number[] = [];
            for (let i = 0; i < goodWeatherSearches.length; i++) {
                goodWeatherIndexArray.push(i);
            }
            //create random index order (Fisher-Yates shuffle)
            for (let i = goodWeatherIndexArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [goodWeatherIndexArray[i], goodWeatherIndexArray[j]] = [goodWeatherIndexArray[j], goodWeatherIndexArray[i]];
            }
            //get results to pass to page for good weather.
            for (let i = 0; i < 5; i++) {
                let activityIndex: number = goodWeatherIndexArray[i];
                //endpoint for geocoding places with mapbox. trying out searchbox
                let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${goodWeatherSearches[activityIndex]}.json?bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}&type=poi&proximity=${longitude},${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
                // let fetchUrl = `https://api.mapbox.com/search/searchbox/v1/category/${goodWeatherSearches[activityIndex]}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}&proximity=${longitude},${latitude}`;
                activityFetchUrls.push(fetchUrl);
            }
            return activityFetchUrls
        } else {
            //get unique random numbers
            let badWeatherIndexArray: number[] = [];
            for (let i = 0; i < badWeatherSearches.length; i++) {
                badWeatherIndexArray.push(i);
            }
            //create random index order (Fisher-Yates shuffle)
            for (let i = badWeatherIndexArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [badWeatherIndexArray[i], badWeatherIndexArray[j]] = [badWeatherIndexArray[j], badWeatherIndexArray[i]];
            }
            for (let i = 0; i < 5; i++) {
                let activityIndex = badWeatherIndexArray[i];
                //endpoint for geocoding places with mapbox. trying out searchbox
                let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${badWeatherSearches[activityIndex]}.json?bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}&type=poi&proximity=${longitude},${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
                // let fetchUrl = `https://api.mapbox.com/search/searchbox/v1/category/${badWeatherSearches[activityIndex]}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}&proximity=${longitude},${latitude}`;
                activityFetchUrls.push(fetchUrl);
                return activityFetchUrls
            }
        }
    } else {
        return
    }

}
/*
[art_gallery, museum, performing_arts_theater, library,amusement_center, aquarium, community_center, cultural_center,  movie_theater, ice_cream_shop, bakery, pet_store, book_store, gym ]
[hiking_area, historical_landmark,national_park, park, zoo,ice_cream_shop, bakery, athletic_field, playground, swimming_pool, community_center  ]
*/

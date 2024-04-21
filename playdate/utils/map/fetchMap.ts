export async function fetchMap(latitude: number, longitude: number, weatherCode: number | undefined) {

    const goodWeatherCodes: number[] = [800, 801, 802, 803, 804, 741];
    const goodWeatherSearches: string[] = ['playground%20', 'hike%20', 'lake%20', 'zoo%20', 'ice%20cream%20', 'track', 'state%20park%20', 'play']
    const badWeatherSearches: string[] = ['museum%20', 'movie%20', 'library%20', 'craft%20', 'theater%20', 'aquarium']
    let activityFetchUrls = []
    const minLatitude = latitude - .5;
    const maxLatitude = latitude + .5;
    const minLongitude = longitude - .5;
    const maxLongitude = longitude + .5;
    console.log(weatherCode)
    if (weatherCode) {
    console.log(goodWeatherCodes.includes(weatherCode))
    }

    if (weatherCode) {
        console.log('run')
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
                let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${goodWeatherSearches[activityIndex]}.json?bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}&type=poi&limit=5&proximity=${longitude},${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
                activityFetchUrls.push(fetchUrl);
                console.log(fetchUrl)
            }
            console.log(activityFetchUrls)
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
                let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${badWeatherSearches[activityIndex]}.json?bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}&type=poi&limit=5&proximity=${longitude},${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
                activityFetchUrls.push(fetchUrl);
                return activityFetchUrls
            }
        }
    } else {
        return
    }

}

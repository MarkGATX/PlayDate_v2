// export async function getCurrentWeather(lat:number, long:number) {
//     try {
//         const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}`)
//         console.log(weatherResponse)
//         if (!weatherResponse.ok) {
//             throw new Error(`Error fetching current weather from utility! status: ${weatherResponse.status}`)
//         }
//         const currentWeather = await weatherResponse.json();
//         console.dir(currentWeather)
//         return currentWeather
//     } catch (error) {
//         console.log(error)
//         return null
//     }
// }
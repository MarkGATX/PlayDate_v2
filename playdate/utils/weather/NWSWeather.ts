export interface CombinedForecastData {
    current_temp: number
    low_temp: number
    high_temp: number
    current_icon: string
    current_id: number
    rain_chance: number | null
}

export async function getCurrentNWSWeather(lat: number, long: number) {
    let forecastData: CombinedForecastData = {
        current_temp: 0,
        low_temp: 0,
        high_temp: 0,
        current_icon: "",
        current_id: 0,
        rain_chance: 0
    }
    try {
        //get forecasted conditions from NWS
        const forecastOffice = await fetch(`https://api.weather.gov/points/${lat},${long}`)
        if (!forecastOffice.ok) {
            throw new Error('Error fetching office grid ID');
        }
        const forecastOfficeData = await forecastOffice.json();
        let forecastEndpoint: string = forecastOfficeData.properties.forecast
        const NWSForecast = await fetch(`${forecastEndpoint}`)
        if (!NWSForecast.ok) {
            throw new Error('Error fetching office grid ID');
        }
        const NWSforecastData = await NWSForecast.json();
        //set rain chance based on current period and high and low forecast temp based on the first two periods returned. Might be a better way but this is quick
        if (NWSforecastData.properties.periods[0].temperature > NWSforecastData.properties.periods[1].temperature) {
            forecastData.low_temp = NWSforecastData.properties.periods[1].temperature
            forecastData.high_temp = NWSforecastData.properties.periods[0].temperature
            forecastData.rain_chance = NWSforecastData.properties.periods[0].probabilityOfPrecipitation.value
        } else {
            forecastData.low_temp = NWSforecastData.properties.periods[0].temperature
            forecastData.high_temp = NWSforecastData.properties.periods[1].temperature
            forecastData.rain_chance = NWSforecastData.properties.periods[0].probabilityOfPrecipitation.value
        }
        //get current conditions from WeatherBit
        const currentOpenWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}`)
        if (!currentOpenWeatherResponse.ok) {
            throw new Error(`Error fetching current weather from utility! status: ${currentOpenWeatherResponse.status}`)
        }
        const currentOpenWeatherData = await currentOpenWeatherResponse.json();
        console.log(currentOpenWeatherData)
        forecastData.current_icon = currentOpenWeatherData.weather[0].id
        forecastData.current_id = currentOpenWeatherData.weather[0].icon
        forecastData.current_temp = currentOpenWeatherData.main.temp.toFixed(0)
        return forecastData
    } catch (error) {
        console.log(error)
    }
}
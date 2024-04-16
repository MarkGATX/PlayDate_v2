interface mainWeatherData {
    feels_like: number
    humidity: number
    pressure: number
    temp: number
    temp_max: number
    temp_min: number
}

interface weatherConditionArray {
    description: string
    icon: string
    id: number
    main: string
}

export interface WeatherData {
    main: mainWeatherData
    weather: weatherConditionArray[]
}

export async function getCurrentWeather(lat: number, long: number) {
    let currentWeather: WeatherData = {
        main: {
            feels_like: 0,
            humidity: 0,
            pressure: 0,
            temp: 0,
            temp_max: 0,
            temp_min: 0
        },
        weather: [
            {
                description: '',
                icon: '',
                id: 0,
                main: ''
            }
        ]
    }
    try {
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}`)
        console.log(currentWeatherResponse)
        if (!currentWeatherResponse.ok) {
            throw new Error(`Error fetching current weather from utility! status: ${currentWeatherResponse.status}`)
        }
        currentWeather = await currentWeatherResponse.json();
        console.dir(currentWeather)
        return currentWeather
        // const forecastWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}`)
        // if (!forecastWeatherResponse.ok) {
        //     throw new Error(`Error fetching forecasted weather from utility! status: ${forecastWeatherResponse.status}`)
        // }
        // let forecastWeather = await forecastWeatherResponse.json();
        // currentWeather = {...currentWeather, }
        // console.log(forecastWeather)
    } catch (error) {
        console.log(error)
        return null
    }
}
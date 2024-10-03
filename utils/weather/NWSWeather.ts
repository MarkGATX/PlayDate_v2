import { CombinedForecastData } from "./WeatherContext";

export async function getCurrentNWSWeather(lat: number, long: number) {
  let forecastData: CombinedForecastData = {
    current_temp: 0,
    low_temp: 0,
    high_temp: 0,
    current_icon: 0,
    current_id: 0,
    rain_chance: 0,
    forecast: "",
  };

  //frequent 500 errors on the return that clear up with a retry shortly after. Setting a while loop to retry a few times automatically
  let retries = 3;
  while (retries > 0) {
    if (lat === 0 && long === 0) {
      throw new Error("Geolocation error. Latitude and Longitude not defined");
    }
    try {
      //get forecasted conditions from NWS
      const forecastOffice = await fetch(
        `https://api.weather.gov/points/${lat},${long}`,
      );
      if (!forecastOffice.ok) {
        forecastData.error = `Error fetching NWS office grid ID`;
        throw new Error("Error fetching office grid ID");
      }
      const forecastOfficeData = await forecastOffice.json();
      let forecastEndpoint: string = forecastOfficeData.properties.forecast;
      const NWSForecast = await fetch(`${forecastEndpoint}`);
      if (!NWSForecast.ok) {
        forecastData.error = `Error fetching NWS grid forecast.`;
        throw new Error("Error fetching office grid forecast");
      }
      if (NWSForecast.status === 500) {
        forecastData.error = `Sorry, we can't get the weather right now. Try again later.`;
        throw new Error("NWS Server error");
      }
      const NWSforecastData = await NWSForecast.json();
      //set rain chance based on current period and high and low forecast temp based on the first two periods returned. Might be a better way but this is quick
      if (
        NWSforecastData.properties.periods[0].temperature >
        NWSforecastData.properties.periods[1].temperature
      ) {
        forecastData.low_temp =
          NWSforecastData.properties.periods[1].temperature;
        forecastData.high_temp =
          NWSforecastData.properties.periods[0].temperature;
        forecastData.rain_chance =
          NWSforecastData.properties.periods[0].probabilityOfPrecipitation.value;
        forecastData.forecast =
          NWSforecastData.properties.periods[0].detailedForecast;
      } else {
        forecastData.low_temp =
          NWSforecastData.properties.periods[0].temperature;
        forecastData.high_temp =
          NWSforecastData.properties.periods[1].temperature;
        forecastData.rain_chance =
          NWSforecastData.properties.periods[0].probabilityOfPrecipitation.value;
        forecastData.forecast =
          NWSforecastData.properties.periods[0].detailedForecast;
      }
      //get current conditions from WeatherBit
      const currentOpenWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}`,
      );
      if (!currentOpenWeatherResponse.ok) {
        throw new Error(
          `Error fetching current weather from utility! status: ${currentOpenWeatherResponse.status}`,
        );
      }
      const currentOpenWeatherData = await currentOpenWeatherResponse.json();
      forecastData.current_icon = currentOpenWeatherData.weather[0].id;
      forecastData.current_id = currentOpenWeatherData.weather[0].icon;
      forecastData.current_temp = currentOpenWeatherData.main.temp.toFixed(0);
      return forecastData;
    } catch (error) {
      if (retries === 1) {
        // If this was the last retry, throw the error
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 2 seconds before the next retry
      retries--;
      console.error(error);
    }
  }
}

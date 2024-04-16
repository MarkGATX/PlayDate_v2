// 'use client'

// import { useEffect, useState } from "react";
// import { WeatherData } from "./WeatherContext";


// //LocationProvider component that holds initial state, returns provider component
// export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
//     const [weatherData, setWeatherData] = useState<WeatherData>({
//         latitude: 0,
//         longitude: 0,
//     });


//     useEffect(() => {
//         const locationSuccess = (position: GeolocationPosition) => {
//             setWeatherData({ 
//                 latitude: position.coords.latitude, 
//                 longitude: position.coords.longitude 
//             });
//         };

//         const locationError = () => {
//             console.error('Error in getting location');
//             setWeatherData({ 
//                 latitude: 0, 
//                 longitude: 0, 
//                 error: "Error in getting location" 
//             });
//         };

//         if ('geolocation' in navigator) {
//             console.log('Geolocation is available');
//             navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
//         } else {
//             console.log('Geolocation is not available');
//             setLocationData({ latitude: 0, longitude: 0, error: "Geolocation is not available" });
//         }
//     }, []);

//     return (
//         <LocationContext.Provider value={locationData}>
//             {children}
//         </LocationContext.Provider>
//     )
// };

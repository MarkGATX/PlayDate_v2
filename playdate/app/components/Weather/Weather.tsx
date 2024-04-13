'use client'
import { useLocationContext } from "@/utils/location/LocationContext"

export default function Weather() {
    const currentLocation = useLocationContext()

    console.log(currentLocation)
    return (
        <section className='w-full pl-2 pr-2'>
            <p>Weather</p>
            {currentLocation.error ?
                <div>Weather info not available</div>
                :
                <>
                    <div>{currentLocation.latitude}</div>
                    <div>{currentLocation.longitude}</div>
                </>
            }
        </section>
    )
}
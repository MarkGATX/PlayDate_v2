import { useState } from "react"
import { WeatherProps } from "../Header/Header"

export default function Weather(props: WeatherProps) {
    console.log(props)

    return (
        <section className='w-full pl-2 pr-2'>
            <p>Weather</p>
            {props.error ?
                <div>Weather info not available</div>
                :
                <>
                    <div>{props.lat}</div>
                    <div>{props.long}</div>
                </>
            }
        </section>
    )
}
export const amenityList: string[] = [
        'Restrooms',
        'Pool',
        'Splash Pad',
        'Wading Pool',
        'Food',
        'Basketball',
        'Tennis',
        'Soccer',
        'Picnic Tables',
        'Toddler Swings',
        'Hiking',
        'Pickle Ball',
        'Softball',
        'Baseball',
        'Shady',
        "Playscape"
]

export type AmenityType = {
        restrooms: boolean
        pool: boolean
        splash_pad: boolean
        wading_pool: boolean
        food: boolean
        basketball: boolean
        tennis: boolean
        soccer: boolean
        picnic_tables: boolean
        toddler_swings: boolean
        hiking: boolean
        pickle_ball: boolean
        softball: boolean
        baseball: boolean
        shady: boolean
        playscape:boolean
}

// Define the mapping of amenities to their corresponding icons
export const amenityIcons = {
        restrooms: '/icons/restrooms.webp',
        pool: '/icons/swimming_pool.webp',
        splash_pad: '/icons/splash_pad.webp',
        wading_pool: '/icons/wading_pool.webp',
        food: '/icons/food.webp',
        basketball: '/icons/basketball.webp',
        tennis: '/icons/tennis.webp',
        soccer: '/icons/soccer.webp',
        picnic_tables: '/icons/picnic_table.webp',
        toddler_swings: '/icons/splash_pad.webp',
        hiking: '/icons/splash_pad.webp',
        pickle_ball: '/icons/splash_pad.webp',
        softball: '/icons/splash_pad.webp',
        baseball: '/icons/splash_pad.webp',
        shady: '/icons/splash_pad.webp',
        playscape: '/icons/playscape.webp'
};
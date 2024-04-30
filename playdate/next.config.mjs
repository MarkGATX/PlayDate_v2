/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'openweathermap.org',
                port: '',
                pathname: '/img/wn/**',
            },
            {
                protocol: 'https',
                hostname: 'places.googleapis.com',
                port: '',
               
            }
        ],
    },
};

export default nextConfig;

export default function useEnv() {
    return {
        timeZone: 5,
        api: {
            // url: process.env.NEXT_PUBLIC_API_URL
            url: 'http://92.38.48.35:20088'
        },
        tarifications: {
            // url: process.env.NEXT_PUBLIC_API_URL
            url: 'http://92.38.48.35:20089'
        },
        schedules: {
            // url: process.env.NEXT_PUBLIC_API_URL
            url: 'http://92.38.48.35:20090'
        },
        operative: {
            // url: process.env.NEXT_PUBLIC_API_URL
            url: 'http://92.38.48.35:20093'
        },
        s3: {
            // url: process.env.NEXT_PUBLIC_S3_API_URL
            url: 'http://92.38.48.35/s3'
        }
    }
}

import { isBrowser } from './is-browser'

export type Path = `/${string}` & { __brand: 'Path' }

export function getBaseUrl(path: Path = '/' as Path) {

    const baseUrl = isBrowser
        ? window.location.origin
        : !process.env.NEXT_PUBLIC_VERCEL_URL
            ? 'http://localhost:3000'
            : ''
    // : process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

    return baseUrl + path
}
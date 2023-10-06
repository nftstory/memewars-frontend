import { Platform } from 'react-native'

import Constants from 'expo-constants'
import type { Path } from './get-base-url.web'
import { getHostname } from './get-hostname'

const hostUri = Constants.manifest2?.extra?.expoClient?.hostUri

const hostname = getHostname()
const appUrl = `https://${hostname}/`
const development = process.env.EXPO_PUBLIC_STAGE === 'development' || __DEV__

export const getBaseUrl = (path: Path = '/' as Path) => {
    const baseUrl = Platform.select({
        web: '/',
        default:
            development && hostUri ? `http://${hostUri.replace('8081', '3000')}/` : appUrl,
    })

    return path.startsWith('/') ? path.replace('/', baseUrl) : path
}
import { Platform } from 'react-native'

export const IS_DEV = Platform.select({
    web: process.env.NODE_ENV === "development",
    default: __DEV__
})

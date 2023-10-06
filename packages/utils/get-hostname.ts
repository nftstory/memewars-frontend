import Constants from 'expo-constants'

export function getHostname() {
    // ! we do not use a array of schemes
    const scheme = Constants.expoConfig?.scheme as string
    const hostname = scheme?.split('.').reverse().join('.')
    if (!hostname) throw new Error('Could not determine hostname')

    return hostname
}
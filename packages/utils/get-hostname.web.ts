export const getHostname = () => {
    return typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '';
}
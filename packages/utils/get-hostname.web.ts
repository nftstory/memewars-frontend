import { isBrowser } from "./is-browser";

export function getHostname() {
    return isBrowser && (window.location.hostname ?? '');
}
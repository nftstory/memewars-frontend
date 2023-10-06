import { Path, getBaseUrl } from './get-base-url.web'

import wretch from 'wretch'

const baseUrl = getBaseUrl('/api' as Path)

export const api = wretch(baseUrl)
    // - our api returns all responses in json
    .errorType('json')
    .resolve((response) => {
        return (
            response
                .notFound((error) => {
                    console.log('Endpoint Not Found Error', error)
                })
                .unauthorized((error) => {
                    console.log('User Unauthorised Error', error)
                })
        )
    })
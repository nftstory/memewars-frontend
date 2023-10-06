import {
    type Base64URLString,
    AuthenticationResponseJSON,
    Passkey as ForumPasskey,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from '@forum/passkeys'
import * as passkeys from 'react-native-passkeys'

// import z from 'zod'
import { getHostname } from './get-hostname'
import { api } from './api'

const hostname = getHostname()

const rp = { id: hostname, name: 'Memewars' } as const

// TODO: convert these to be static methods?
export class Passkey extends ForumPasskey {
    constructor(
        params?: Partial<
            Pick<PublicKeyCredentialCreationOptionsJSON, 'pubKeyCredParams' | 'authenticatorSelection'>
        >,
    ) {
        super({ ...params, rp })
    }

    async create(
        passedOptions: Omit<
            PublicKeyCredentialCreationOptionsJSON,
            'rp' | 'pubKeyCredParams' | 'challenge'
        > & { challenge: Base64URLString, csrfToken: string } &
            Partial<Pick<PublicKeyCredentialCreationOptionsJSON, 'pubKeyCredParams'>>,
    ): Promise<RegistrationResponseJSON | null> {
        const { challenge, csrfToken } = passedOptions
        const options = {
            rp: this.rp,
            pubKeyCredParams: this.pubKeyCredParams,
            ...passedOptions,
            authenticatorSelection: {
                ...this.authenticatorSelection,
                ...passedOptions.authenticatorSelection,
            },
        }

        const username = options.user.name.trim()

        try {
            const passkeyResult = await passkeys.create({ ...options, challenge })

            if (!passkeyResult) throw new Error('Failed to create passkey')

            const {
                id: credentialId,
                response: { attestationObject: rawAttestationObject, clientDataJSON: rawClientDataJSON },
            } = passkeyResult

            const res = await api
                .url('/auth/callback/credentials/')
                .post({
                    username,
                    rawAttestationObject,
                    rawClientDataJSON,
                    credentialId,
                    csrfToken,
                })
                .res()

            if (!res || !res.ok) {
                console.log('failed to post credentials', res)
                throw new Error('Failed to create credentials')
            }

            return passkeyResult
        } catch (e) {
            console.error('error', e)
            // TODO: write isPasskeyError util
            // if (isPasskeyError(e) && e.error === 'UserCancelled') {
            //     analytics.track('User Cancelled Passkey')
            //     return null
            // }
            // if (isPasskeyError(e) && e.error === 'Unknown error') {
            //     analytics.track('User Passkey Unknown Error')
            //     throw e
            // }
            return null
        }
    }

    async get(
        options: Omit<PublicKeyCredentialRequestOptionsJSON, 'rpId' | 'challenge'>,
    ): Promise<AuthenticationResponseJSON | null> {
        console.log(options)
        return null
    }

    // async writeBlob(
    //     credentialId: string,
    //     blobData: ForumSecretBlob,
    //     storer: (blobData: ForumSecretBlob) => Base64URLString = forumBlobStorer,
    // ) {
    //     const write = await this.get({
    //         extensions: { largeBlob: { write: storer(blobData) } },
    //         allowCredentials: [{ type: 'public-key', id: credentialId }],
    //     })

    //     return write?.clientExtensionResults.largeBlob?.written
    // }

    // async readBlob(
    //     credentialId: string,
    //     parser: (blob: string) => ForumSecretBlob = forumBlobParser,
    // ) {
    //     const read = await this.get({
    //         extensions: { largeBlob: { read: true } },
    //         allowCredentials: [{ type: 'public-key', id: credentialId }],
    //     })

    //     const blob = read?.clientExtensionResults.largeBlob?.blob

    //     if (!blob) throw new Error('No blob found')
    //     return parser(blob)
    // }

}

// export type PasskeyAuthResult = ReturnType<InstanceType<typeof ForumPasskey>['signR1']>
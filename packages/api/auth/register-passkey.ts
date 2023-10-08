import type { Prisma, PrismaClient } from '@prisma/client'

import { fromBuffer, toBuffer } from '@forum/utils/base64-url'
import { getPublicKeyFromCOSEPublicKey } from '@forum/utils/cose'
import { decodeAttestationObject } from '@forum/utils/decode-attestation-object'
import { AccountType, getAccountAddress } from '@forum/utils/get-account-address'
import { getAccountSalt } from '@forum/utils/get-init-code'
import { parseAuthenticatorData } from '@forum/utils/parse-auth-data'

import * as z from 'zod'

export const PasskeyRegisterationResultSchema = z.object({
    username: z.string(),
    rawAttestationObject: z.string(),
    rawClientDataJSON: z.string(),
    credentialID: z.string(),
})

export const webauthnClientDataSchema = z.object({
    type: z.string(),
    challenge: z.string(),
    origin: z.string(),
    crossOrigin: z.string().optional(),
})

export const registerPasskey = async ({
    input,
    prisma,
}: {
    input: z.infer<typeof PasskeyRegisterationResultSchema>
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, any>
}) => {
    try {
        const { username, rawAttestationObject, rawClientDataJSON, credentialID } = input

        const clientDataBuffer = Buffer.from(rawClientDataJSON, 'base64')
        const clientData = webauthnClientDataSchema.parse(JSON.parse(clientDataBuffer.toString()))

        const attestationBuffer = toBuffer(rawAttestationObject, 'base64')

        const decodedAttestationObject = decodeAttestationObject(attestationBuffer)

        const { authData } = decodedAttestationObject ?? {}

        if (!authData) throw new Error('No auth data found')

        const parsedAuthData = parseAuthenticatorData(authData)

        const { credentialPublicKey: rawCredentialPublicKey } = parsedAuthData

        if (!rawCredentialPublicKey || !credentialID) return

        // - convert base64url challenge -> base64
        const challenge = fromBuffer(toBuffer(clientData.challenge, 'base64url'), 'base64')

        console.log('challenge', {
            challenge,
            challengeFound: await prisma.challenge.findFirst({ where: { challenge } }),
        })
        // ! PUT ME BACK IN COACH
        // await prisma.challenge.findFirstOrThrow({ where: { challenge } })
        // await prisma.challenge.delete({ where: { challenge } })

        const { x, y } = getPublicKeyFromCOSEPublicKey(rawCredentialPublicKey)
        const base64PublicKey = Buffer.from(rawCredentialPublicKey).toString('base64')

        const address = getAccountAddress(getAccountSalt([x, y]), AccountType.USER)

        return {
            x,
            y,
            address,
            base64PublicKey,
            credentialID,
            publicKey: `0x${[x, y].join('').replaceAll('0x', '')}` as `0x${string}`,
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message)
            throw e
        }
    }
}
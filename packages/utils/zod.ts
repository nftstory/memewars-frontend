import * as z from 'zod'

/**
 * - Branded Types to make it clearer how to encode and decode certain types
 */

export const Base64URLStringSchema = z.string().brand<'Base64URL'>()
export type Base64URLString = z.infer<typeof Base64URLStringSchema>

export const Base64StringSchema = z.string().brand<'Base64'>()
export type Base64String = z.infer<typeof Base64StringSchema>

export const AsciiStringSchema = z.string().brand<'Ascii'>()
export type AsciiString = z.infer<typeof AsciiStringSchema>

/**
 * Webauthn Schemas
 */

const webauthnResultBaseSchema = z.object({
    username: z.string(),
    rawClientDataJSON: z.string(),
    credentialID: Base64URLStringSchema,
})

export const webauthnAuthResultSchema = z.object({
    signature: Base64URLStringSchema,
    rawAuthenticatorData: Base64URLStringSchema,
    base64PublicKey: Base64URLStringSchema,
}).merge(webauthnResultBaseSchema)


export const webauthnRegisterationResultSchema = z.object({
    rawAttestationObject: Base64URLStringSchema,
}).merge(webauthnResultBaseSchema)

export const webauthnClientDataSchema = z.object({
    type: z.string(),
    challenge: Base64URLStringSchema,
    origin: z.string(),
    crossOrigin: z.string().optional(),
})


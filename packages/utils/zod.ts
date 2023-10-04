import * as z from 'zod'

/**
 * - Branded Types to make it clearer how to encode and decode certain types
 */

export const base64URLStringSchema = z.string().brand<'Base64URL'>()
export type Base64URLString = z.infer<typeof base64URLStringSchema>

export const base64StringSchema = z.string().brand<'Base64'>()
export type Base64String = z.infer<typeof base64StringSchema>

export const asciiStringSchema = z.string().brand<'Ascii'>()
export type AsciiString = z.infer<typeof asciiStringSchema>

export const publicKeyCredentialTypeSchema = z.enum(['public-key']).brand<'PublicKeyCredentialType'>().default('public-key')
export type PublicKeyCredentialType = z.infer<typeof publicKeyCredentialTypeSchema>

export const authenticatorAttachmentSchema = z.enum(['platform', 'cross-platform']).brand<'AuthenticatorAttachment'>()
export type AuthenticatorAttachment = z.infer<typeof authenticatorAttachmentSchema>

/**
 * Webauthn Schemas
 */
const webauthnResultBaseSchema = z.object({
    id: base64URLStringSchema,
    rawId: base64URLStringSchema,
    type: publicKeyCredentialTypeSchema
})

const authenticatorAssertionResponseJSONSchema = z.object({
    userHandle: base64URLStringSchema,
    signature: base64URLStringSchema,
    clientDataJSON: base64URLStringSchema,
    authenticatorData: base64URLStringSchema,
})

// const webauthnClientDataSchema = z.object({
//     type: z.string(),
//     challenge: base64URLStringSchema,
//     origin: z.string(),
//     crossOrigin: z.string().optional(),
// })

const credentialPropertiesOutputSchema = z.object({
    rk: z.boolean().optional(),
})

/**
 * - Specification reference: https://w3c.github.io/webauthn/#dictdef-authenticationextensionslargebloboutputs
 */
const authenticationExtensionsLargeBlobOutputsSchema = z.object({
    supported: z.boolean().optional(),
    blob: base64URLStringSchema.optional(),
    written: z.boolean().optional()
})

const authenticationExtensionsClientOutputsSchema = z.object({
    appid: z.boolean().optional(),
    credProps: credentialPropertiesOutputSchema.optional(),
    hmacCreateSecret: z.boolean().optional(),
    largeBlob: authenticationExtensionsLargeBlobOutputsSchema.optional()
})

/**
 * ! The following are the useful schema above is all sub-schemas
 */

export const webauthnAuthenticationResponseSchema = z.object({
    response: authenticatorAssertionResponseJSONSchema,
    authenticatorAttachment: authenticatorAttachmentSchema.optional(),
    clientExtensionResults: authenticationExtensionsClientOutputsSchema
}).merge(webauthnResultBaseSchema)

export const webauthnRegisterationResultSchema = z.object({
    rawAttestationObject: base64URLStringSchema,
}).merge(webauthnResultBaseSchema)


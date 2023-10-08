import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authenticators, db, users } from "@db/index";
import { eq, sql } from 'drizzle-orm'
import Credentials from "next-auth/providers/credentials";
import * as jose from 'jose'
import {
    type VerifiedAuthenticationResponse,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
    VerifiedRegistrationResponse
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { type Base64URLString, webauthnAuthenticationResponseSchema, webauthnRegisterationResultSchema } from "@forum/passkeys/src/utils/webauthn-zod";
import { base64UrlStringtoBuffer, bufferToBase64UrlString } from "@utils/base64-url";

/**
 * Prepared statements can be used across serverless executions and so will be much faster 
 * ! beware this may cause connection pooling issues if db doesn't support see (4) in https://www.felixvemmer.com/blog/drizzle-orm-boosting-developer-productivity/
 * - docs: https://orm.drizzle.team/docs/perf-serverless
 */
const getUsersAuthenticator = db.query.authenticators.findFirst({
    where: (authenticator, { eq }) => eq(authenticator.credentialID, sql.placeholder('credentialID')),
    with: { user: { with: { accounts: true } } }
}).prepare('getUsersAuthenticator')

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export const authOptions = {
    debug: process.env.NODE_ENV !== "production",
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" } as const,
    secret: process.env.NEXTAUTH_SECRET!,
    pages: { signIn: '/sign-up' },
    providers: [
        Credentials({
            name: "WebAuthn",
            credentials: {
                username: { label: "Username", type: "text ", placeholder: "vitalik" },
            },
            async authorize(credentials, response) {
                if (!db) throw new Error('Missing db credentials')
                if (!credentials) return null

                console.log('authorize', credentials, response)

                const authCredentials = webauthnAuthenticationResponseSchema.safeParse(credentials)

                if (authCredentials.success) {

                    // TODO: track the results of largeBlob storage
                    const { id: credentialID, clientExtensionResults: _ } = authCredentials.data

                    const authenticator = await getUsersAuthenticator.execute({ credentialID })

                    if (!authenticator?.id || !authenticator?.credentialID || !authenticator.credentialPublicKey)
                        throw new Error(
                            `Could not find authenticator with credentialID ${credentialID}`
                        );

                    const { user } = authenticator

                    if (!user) return null;

                    const expectedChallenge = user.currentChallenge;

                    if (!expectedChallenge)
                        throw new Error(
                            `Could not find expected challenge for user ${user.id}`
                        );

                    let verification: VerifiedAuthenticationResponse;
                    try {
                        verification = await verifyAuthenticationResponse({
                            response: authCredentials.data,
                            expectedChallenge,
                            expectedOrigin,
                            expectedRPID: rpID,
                            authenticator: {
                                credentialID: base64UrlStringtoBuffer(authenticator.credentialID),
                                credentialPublicKey: base64UrlStringtoBuffer(authenticator.credentialPublicKey),
                                counter: authenticator.counter,
                            },
                        });
                    } catch (error) {
                        console.error(error);
                        return null;
                    }

                    const { verified, authenticationInfo } = verification || {};

                    // TODO: do we want to track this?
                    console.log('authenticationInfo', authenticationInfo)

                    if (verified) {
                        const [updatedUser] = await db.update(users).set({ currentChallenge: '' as Base64URLString })
                            .where(eq(users.id, user.id))
                            .returning();

                        if (updatedUser)
                            // TODO: this needs to match what next-auth expects ... can we override?
                            return updatedUser;
                    }
                }
                else {
                    const registrationCredentials = webauthnRegisterationResultSchema.safeParse(credentials)

                    if (registrationCredentials.success) {
                        // - at this point we haven't give the user an account but we have given them a challenge
                        // - so we check that the user has returned a challenge matching that on their init cookie
                        const cookies = Object.fromEntries(response.headers?.cookie?.split('; ').map(c => c.split('=') as [string, string]) ?? [])
                        const challengeJwt = cookies?.['next-auth.challenge']

                        const { payload } = await jose.jwtVerify(challengeJwt, secret, {
                            issuer: process.env.NEXTAUTH_URL!,
                        })

                        const expectedChallenge = payload.challenge as string;

                        if (!expectedChallenge) throw new Error("Could not find expected challenge")

                        let verification: VerifiedRegistrationResponse | undefined;
                        try {
                            verification = await verifyRegistrationResponse({
                                response: registrationCredentials.data,
                                expectedChallenge,
                                expectedOrigin,
                                expectedRPID: rpID,
                                requireUserVerification: true,
                            });
                        } catch (error) {
                            console.error(error);
                            return null
                        }

                        if (!verification?.verified)
                            return null

                        const { registrationInfo: {
                            credentialPublicKey,
                            credentialID,
                            counter,
                            credentialBackedUp,
                            credentialDeviceType,
                        } = {} } = verification;

                        // Save the authenticator info so that we can
                        // get it by user ID later
                        if (!credentialID || !credentialPublicKey)
                            return null

                        const authenticator = {
                            credentialID: bufferToBase64UrlString(credentialID),
                            credentialPublicKey: bufferToBase64UrlString(credentialPublicKey),
                            counter: counter ?? 0,
                            credentialBackedUp: credentialBackedUp ?? false,
                            credentialDeviceType: credentialDeviceType ?? "singleDevice",
                        };

                        let user: typeof users.$inferSelect | null = null

                        await db.transaction(async (tx) => {
                            await tx.insert(authenticators).values(authenticator)
                            const userResult = await tx.insert(users).values({
                                username: credentials.username,
                            }).returning()

                            user = userResult[0] || null
                        })

                        return user
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, credentials }) {
            console.log('signIn', { user, account, credentials })
            // // - only authorization credentials from a passkey will contain `signature`
            // if (!!credentials && !('signature' in credentials)) {
            //     const { username, credentialID: credentialId } =
            //         credentials as unknown as RNPasskeyCredentials

            //     const supabaseUser = await prisma.user.create({
            //         data: {
            //             // rome-ignore lint/style/noNonNullAssertion: using credential provider `account` should be defined
            //             accounts: { create: { ...account! } },
            //             credential: { create: { credentialPublicKey: user.base64PublicKey, credentialId } },
            //             address: user.address,
            //             username,
            //             publicKey: `0x${[user.x, user.y].join('').replaceAll('0x', '')}`,
            //         },
            //     })

            //     console.log('created supabase user', { supabaseUser })
            // }

            return true
        },
        // ! user has been reset by this point for some reason so setting a var to handle it
        async session({ session, token, ...rest }) {
            const signingSecret = process.env.NEXTAUTH_SECRET

            if (!signingSecret) throw new Error('Signing secret not found')
            if (!token.name) throw new Error('Username not found')

            console.log('session', { session, token, ...rest })
            // db.insert(sessions).values({
            //     userId: token.name,
            //     expiresAt: new Date(session.expires),
            // }

            // tODO: init supabase jwt if we want to use it

            return session
        },
    },
}
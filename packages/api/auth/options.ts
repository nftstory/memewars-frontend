import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authenticators, db, users } from "@db/index";
import { eq, sql } from 'drizzle-orm'
import Credentials from "next-auth/providers/credentials";

import {
    type VerifiedAuthenticationResponse,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
    VerifiedRegistrationResponse
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { type Base64URLString, webauthnAuthenticationResponseSchema, webauthnRegisterationResultSchema } from "@forum/passkeys";
import { base64UrlStringtoBuffer, bufferToBase64UrlString } from "@utils/base64-url";

/**
 * Prepared statements can be used across serverless executions and so will be much faster
 * https://orm.drizzle.team/docs/perf-serverless
 */

const getUsersAuthenticator = db.query.authenticators.findFirst({
    where: (authenticator, { eq }) => eq(authenticator.credentialID, sql.placeholder('credentialID')),
    with: { user: { with: { accounts: true } } }
}).prepare('getUsersAuthenticator')


export const authOptions = {
    debug: process.env.NODE_ENV !== "production",
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Credentials({
            id: "webauthn",
            name: "WebAuthn",
            credentials: {
                username: { label: "Username", type: "text ", placeholder: "vitalik" },
            },
            async authorize(credentials, response) {
                if (!db) throw new Error('Missing db credentials')
                if (!credentials) return null

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
                        const headers = new Headers(response.headers);
                        const cookies = headers.getSetCookie()

                        // TODO: search cookies for challenge
                        // TODO: decrypt cookie value of challenge
                        // TODO: create challenge function and encrypt challenge
                        const expectedChallenge = ''


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
}
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, users } from "@db/index";
import { eq, sql } from 'drizzle-orm'
import Credentials from "next-auth/providers/credentials";

import { type VerifiedAuthenticationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { Base64URLString, webauthnAuthenticationResponseSchema, webauthnRegisterationResultSchema } from "@utils/zod";
import { base64UrlStringtoBuffer } from "@utils/base64-url";

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
    providers: [
        Credentials({
            id: "webauthn",
            name: "WebAuthn",
            credentials: {},
            async authorize(credentials) {
                if (!db) throw new Error('Missing db credentials')
                if (!credentials) return null

                const authCredentials = webauthnAuthenticationResponseSchema.safeParse(credentials)

                if (authCredentials.success) {

                    const {
                        id: credentialID,
                        // TODO: track the results of largeBlob storage
                        // clientExtensionResults
                    } = authCredentials.data


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
                        // TODO: register user

                    }
                }

                return null;
            },
        }),
    ],
}
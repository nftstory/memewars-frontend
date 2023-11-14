import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, authenticators, db, users } from "@memewar/db/index";
import { eq, sql } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import * as jose from "jose";
import {
	type VerifiedAuthenticationResponse,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
	VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import {
	type Base64URLString,
	webauthnAuthenticationResponseSchema,
	webauthnRegistrationResponseSchema,
} from "webauthn-zod";
import {
	base64UrlStringToBuffer,
	bufferToBase64UrlString,
} from "@memewar/utils/base64-url";

/**
 * Prepared statements can be used across serverless executions and so will be much faster
 * ! beware this may cause connection pooling issues if db doesn't support see (4) in https://www.felixvemmer.com/blog/drizzle-orm-boosting-developer-productivity/
 * - docs: https://orm.drizzle.team/docs/perf-serverless
 */
const getUsersAuthenticator = db.query.authenticators
	.findFirst({
		where: (authenticator, { eq }) =>
			eq(authenticator.credentialID, sql.placeholder("credentialID")),
		with: { user: { with: { accounts: true } } },
	})
	.prepare("getUsersAuthenticator");

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const secret = process.env.NEXTAUTH_SECRET!;
const encodedSecret = new TextEncoder().encode(secret);

export const authOptions = {
	debug: process.env.NODE_ENV !== "production",
	adapter: DrizzleAdapter(db),
	session: { strategy: "jwt" } as const,
	secret,
	pages: { signIn: "/sign-up" },
	providers: [
		Credentials({
			name: "WebAuthn",
			credentials: {
				username: { label: "Username", type: "text ", placeholder: "vitalik" },
			},
			async authorize(credentials, response) {
				if (!db) throw new Error("Missing db credentials");
				if (!credentials) return null;

				console.log("authorize - ", credentials);

				const authCredentials =
					webauthnAuthenticationResponseSchema.safeParse(credentials);

				if (authCredentials.success) {
					// TODO: track the results of largeBlob storage
					const { id: credentialID, clientExtensionResults: _ } =
						authCredentials.data;

					const authenticator = await getUsersAuthenticator.execute({
						credentialID,
					});

					console.log("authCredentials - ", authenticator);
					if (
						!authenticator?.id ||
						!authenticator?.credentialID ||
						!authenticator.credentialPublicKey
					)
						throw new Error(
							`Could not find authenticator with credentialID ${credentialID}`,
						);

					const { user } = authenticator;

					if (!user) return null;

					console.log("user", user);

					// TODO: PUT ME BACK IN COACH!
					// const expectedChallenge = user.currentChallenge;
					const expectedChallenge = (await getChallengeFromCookie(
						response.headers?.cookie,
					)) as string;

					if (!expectedChallenge)
						throw new Error(
							`Could not find expected challenge for user ${user.id}`,
						);

					console.log("pre verificion - ", {
						response: authCredentials.data,
						expectedChallenge,
						expectedOrigin,
						expectedRPID: rpID,
						authenticator: {
							credentialID: base64UrlStringToBuffer(authenticator.credentialID),
							credentialPublicKey: base64UrlStringToBuffer(
								authenticator.credentialPublicKey,
							),
							counter: authenticator.counter,
						},
					});
					let verification: VerifiedAuthenticationResponse;
					try {
						verification = await verifyAuthenticationResponse({
							response: authCredentials.data,
							expectedChallenge,
							expectedOrigin,
							expectedRPID: rpID,
							authenticator: {
								credentialID: base64UrlStringToBuffer(
									authenticator.credentialID,
								),
								credentialPublicKey: base64UrlStringToBuffer(
									authenticator.credentialPublicKey,
								),
								counter: authenticator.counter,
							},
						});
					} catch (error) {
						console.error(error);
						return null;
					}

					const { verified, authenticationInfo } = verification || {};

					// TODO: do we want to track this?
					console.log("authenticationInfo", authenticationInfo);

					if (verified) {
						const [updatedUser] = await db
							.update(users)
							.set({ currentChallenge: "" as Base64URLString })
							.where(eq(users.id, user.id))
							.returning();

						if (updatedUser)
							// TODO: this needs to match what next-auth expects ... can we override?
							return updatedUser;
					}
				} else {
					const registrationCredentials =
						webauthnRegistrationResponseSchema.safeParse(credentials);

					if (registrationCredentials.success) {
						// - at this point we haven't give the user an account but we have given them a challenge
						// - so we check that the user has returned a challenge matching that on their init cookie
						const expectedChallenge = (await getChallengeFromCookie(
							response.headers?.cookie,
						)) as string;

						if (!expectedChallenge)
							throw new Error("Could not find expected challenge");

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
							return null;
						}

						if (!verification?.verified) return null;

						const {
							registrationInfo: {
								credentialPublicKey,
								credentialID,
								counter,
								credentialBackedUp,
								credentialDeviceType,
							} = {},
						} = verification;

						// Save the authenticator info so that we can
						// get it by user ID later
						if (!credentialID || !credentialPublicKey) return null;

						const authenticator = {
							credentialID: bufferToBase64UrlString(credentialID),
							credentialPublicKey: bufferToBase64UrlString(credentialPublicKey),
							counter: counter ?? 0,
							credentialBackedUp: credentialBackedUp ?? false,
							credentialDeviceType: credentialDeviceType ?? "singleDevice",
						};

						let user: typeof users.$inferSelect | null = null;

						await db.transaction(async (tx) => {
							const userResult = await tx
								.insert(users)
								.values({ username: credentials.username })
								.returning();

							user = userResult[0] || null;

							if (!user) throw new Error("Failed to create user");

							await tx
								.insert(authenticators)
								.values({ ...authenticator, userId: user.id });

							await tx.insert(accounts).values({
								providerAccountId: user.id,
								userId: user.id,
								type: "credentials",
								provider: "credentials",
							});
						});

						// @ts-ignore: fixme this is wrong it is returning a value the closure is fucking it up
						return { ...user, authenticator };
					}
				}

				return null;
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, credentials }) {
			console.log("signIn", { user, account, credentials });

			return true;
		},
		async jwt({ token, user, ...rest }) {
			console.log("jwt", { token, user, ...rest });
			if (user?.username) token.username = user.username;
			if (user?.authenticator) token.authenticator = user.authenticator;

			return token;
		},
		// ! user has been reset by this point for some reason so setting a var to handle it
		async session({ session, token, ...rest }) {
			console.log("session", { session, token, ...rest });

			if (token?.sub && token?.username) {
				session.user = {
					id: token.sub,
					username: token.username,
					authenticator: token.authenticator,
				};
			}

			// if (!secret) throw new Error('Signing secret not found')
			// if (!token.name) throw new Error('Username not found')

			// db.insert(sessions).values({
			//     userId: token.name,
			//     expiresAt: new Date(session.expires),
			// }

			// tODO: init supabase jwt if we want to use it

			return session;
		},
	},
};

const getChallengeFromCookie = async (cookie) => {
	const cookies = Object.fromEntries(
		cookie?.split("; ").map((c) => c.split("=") as [string, string]) ?? [],
	);
	const challengeJwt = cookies?.["next-auth.challenge"];

	const { payload } = await jose.jwtVerify(challengeJwt, encodedSecret, {
		issuer: NEXTAUTH_URL,
	});

	return payload.challenge;
};

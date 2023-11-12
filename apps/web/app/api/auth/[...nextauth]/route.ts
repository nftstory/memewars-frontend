import NextAuth, { getServerSession } from "next-auth";
import { authOptions } from "@api/auth/options";
import * as crypto from "crypto";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { db, users } from "@db/index";
import { bufferToBase64UrlString } from "@utils/base64-url";
import type { Base64URLString } from "webauthn-zod";
import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import * as jose from "jose";

interface RouteHandlerContext {
	params: { nextauth: string[] };
}

export async function POST(req: NextRequest, context: RouteHandlerContext) {
	const { params } = context;
	const headersStore = headers();

	const hasXChallenge = !!headersStore.get("x-challenge");
	let challenge: Base64URLString | undefined;

	if (params?.nextauth.includes("csrf") && hasXChallenge) {
		// - post request to this route should have an existing user
		const session = await getServerSession();

		if (session) {
			// @ts-expect-error: our next auth session override isn't working?
			await storeChallenge({ userId: session.user.id })
		}
	}

	const response = await NextAuth(authOptions)(req, context);

	if (response as Response) {
		response.headers.set("x-challenge", challenge);
	}

	return response;
}

export async function GET(req: NextRequest, context: RouteHandlerContext) {
	const { params } = context;

	if (!params?.nextauth.includes("csrf"))
		return await NextAuth(authOptions)(req, context);

	// - get request to `csrf` is a potential new user
	// - if they are new we cannot have a `currentChallenge` we pass it in a secure cookie instead

	// - if it is a user who has not lost their session then we check if a credentialId was passed 
	// - In which case we attach the challenge to the user as we would in the POST endpoint

	let challenge: Base64URLString | undefined;
	const credentialId = req.nextUrl.searchParams.get('cid')

	if (credentialId) {
		challenge = await storeChallenge({ credentialId })
	} else {
		const cookieStore = cookies();
		const headersStore = headers();

		const hasXChallenge = !!headersStore.get("x-challenge");

		if (hasXChallenge) {
			const rawChallenge = crypto.randomBytes(32);
			challenge = bufferToBase64UrlString(rawChallenge);

			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

			const challengeJwt = await new jose.SignJWT({ challenge })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				.setIssuer(process.env.NEXTAUTH_URL!)
				.setExpirationTime("1h")
				.sign(secret);

			cookieStore.set({
				name: "next-auth.challenge",
				value: challengeJwt,
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				domain: process.env.NEXTAUTH_URL!,
				maxAge: 60 * 60, // - 1 hour,
			});
		}
	}

	const response = await NextAuth(authOptions)(req, context);

	if (response as Response) {
		response.headers.set("x-challenge", challenge);
	}

	return response;
}

async function storeChallenge(args: { userId: string } | { credentialId: string }) {
	const rawChallenge = crypto.randomBytes(32);
	const challenge = bufferToBase64UrlString(rawChallenge);

	if ('userId' in args) {
		const updatedUser = await db
			.update(users)
			.set({ currentChallenge: challenge })
			.where(eq(users.id, args.userId))
			.returning();
		if (!updatedUser) throw new Error("Failed to update user");

		return challenge
	}

	const { credentialId } = args

	const currentUser = await db.query.users.findFirst({
		with: {
			authenticators: {
				where(fields, operators) {
					return operators.sql`${fields.credentialID} = ${credentialId}`
				}
			}
		},
	})


	console.log('currentUser', currentUser)

	return challenge

}
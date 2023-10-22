import NextAuth, { getServerSession } from "next-auth";
import { authOptions } from "@api/auth/options";
import * as crypto from "crypto";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { db, users } from "@db/index";
import { bufferToBase64UrlString } from "@utils/base64-url";
import type { Base64URLString } from "@forum/passkeys";
import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import * as jose from "jose";

interface RouteHandlerContext {
	params: { nextauth: string[] };
}

export async function POST(req: NextRequest, context: RouteHandlerContext) {
	console.log("POST", context, req);
	const { params } = context;
	const headersStore = headers();

	const hasXChallenge = !!headersStore.get("x-challenge");
	let challenge: Base64URLString | undefined;

	if (params?.nextauth.includes("csrf") && hasXChallenge) {
		// - post request to this route should have an existing user
		const session = await getServerSession();

		if (session) {
			const rawChallenge = crypto.randomBytes(32);
			const challenge = bufferToBase64UrlString(rawChallenge);

			const updatedUser = await db
				.update(users)
				.set({ currentChallenge: challenge })
				// @ts-expect-error: id should exist on session?
				.where(eq(users.id, session.user.id))
				.returning();
			if (!updatedUser) throw new Error("Failed to update user");
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
	// - since they are new we cannot have a `currentChallenge` we pass it in a secure cookie instead

	const cookieStore = cookies();
	const headersStore = headers();

	const hasXChallenge = !!headersStore.get("x-challenge");
	let challenge: Base64URLString | undefined;

	if (hasXChallenge) {
		const rawChallenge = crypto.randomBytes(32);
		challenge = bufferToBase64UrlString(rawChallenge);

		const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

		const challengeJwt = await new jose.SignJWT({ challenge })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setIssuer(process.env.NEXTAUTH_URL!)
			.setExpirationTime("1h")
			.sign(secret);

		cookieStore.set({
			name: "next-auth.challenge",
			value: challengeJwt,
			domain: process.env.NEXTAUTH_URL!,
			maxAge: 60 * 60, // - 1 hour,
		});
	}

	const response = await NextAuth(authOptions)(req, context);

	if (response as Response) {
		response.headers.set("x-challenge", challenge);
	}

	return response;
}

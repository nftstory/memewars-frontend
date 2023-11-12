import { api } from "@memewar/utils/api";
import { csrfTokenSchema } from "../app/features/auth/auth.signup.form.schema";
import type { Base64URLString } from "webauthn-zod";

export async function generateChallenge() {
	const res = await api
		.headers({ "x-challenge": "true" })
		.get("/auth/csrf")
		.res();

	if (!res.ok) throw new Error("Failed to fetch token");

	const { csrfToken } = csrfTokenSchema.parse(await res.json());

	const challenge = res.headers.get("x-challenge") as
		| Base64URLString
		| undefined;

	// ? too harsh throwing an error here?
	if (!challenge || !csrfToken)
		throw new Error("Something went wrong initing challenge");

	// TODO: write an abstraction for storage here from the web version
	// localStorage.setItem("csrfToken", csrfToken);
	// localStorage.setItem("challenge", challenge);
	return { challenge, csrfToken };
}

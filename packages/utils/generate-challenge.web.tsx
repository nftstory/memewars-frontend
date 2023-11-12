import { api } from "@memewar/utils/api";
import { csrfTokenSchema } from "../app/features/auth/auth.signup.form.schema";

// - The credentialId is stored in local storgae by @forum/passkeys with the following key
const CREDENTIAL_ID_LOCAL_STORAGE_KEY = "passkey-storage.account-credentialId";

export async function generateChallenge() {
	// - if we have a credentialId already stored then we ask the server to store the current challenge
	// - on the user who owns the credentialId.
	const credentialId = localStorage.getItem(CREDENTIAL_ID_LOCAL_STORAGE_KEY);

	const res = await api
		.headers({ "x-challenge": "true" })
		.get(`/auth/csrf${credentialId ? `/${credentialId}` : ""}`)
		.res();

	if (!res.ok) throw new Error("Failed to fetch token");

	const { csrfToken } = csrfTokenSchema.parse(await res.json());

	const challenge = res.headers.get("x-challenge");

	// ? too harsh throwing an error here?
	if (!challenge || !csrfToken)
		throw new Error("Something went wrong initing challenge");

	// TODO: write an abstraction for storage here
	localStorage.setItem("csrfToken", csrfToken);
	localStorage.setItem("challenge", challenge);
	return { challenge, csrfToken };
}

import { type Base64URLString } from "@forum/passkeys";
import { useZodForm } from "@memewar/app/hooks/use-zod-form";
import { Passkey } from "@memewar/app/lib/passkey";
import { api } from "@memewar/utils/api";
import { AsciiString, asciiToBase64UrlString } from "@memewar/utils/base64-url";
import { getBaseUrl } from "@memewar/utils/get-base-url";
import { getHostname } from "@memewar/utils/get-hostname";
import { useCallback, useEffect } from "react";
import { csrfTokenSchema, usernameFormSchema } from "./auth.signup.form.schema";

const passkey = new Passkey();

export const useSignUpForm = () => {
	const methods = useZodForm({ schema: usernameFormSchema });

	const signUp = useCallback<Parameters<typeof methods["handleSubmit"]>[0]>(
		async ({ username }) => {
			console.log("username", username);
			const challenge = localStorage.getItem("challenge") as
				| Base64URLString
				| undefined;
			const csrfToken = localStorage.getItem("csrfToken");

			if (!challenge || !csrfToken)
				throw new Error("Could not find challenge or token");

			console.log("hostname", getHostname());
			console.log("baseUrl", getBaseUrl());

			const result = await passkey.create({
				challenge,
				csrfToken,
				user: {
					id: asciiToBase64UrlString(username as AsciiString),
					name: username,
					displayName: username,
				},
				extensions: { largeBlob: { support: "required" } },
			});

			console.log("result", result);

			// TODO: What do we want to do if the users device doesn't support largeBlob?
			// ! for now we will block the user from using the application if this is the case
			if (!result?.clientExtensionResults.largeBlob?.supported)
				throw new Error("Device not supported");

			return result;
		},
		[],
	);

	// - on mount init a challenge
	useEffect(() => {
		// tODO: only do this if we do not have a session / redirect if the user has a session
		api
			.headers({ "x-challenge": "true" })
			.get("/auth/csrf")
			.res()
			.then(async (res) => {
				if (!res.ok) throw new Error("Failed to fetch token");

				const { csrfToken } = csrfTokenSchema.parse(await res.json());

				const challenge = res.headers.get("x-challenge");

				// ? too harsh throwing an error here?
				if (!challenge || !csrfToken)
					throw new Error("Something went wrong initing challenge");

				// TODO: write an abstraction for storage here
				localStorage.setItem("csrfToken", csrfToken);
				localStorage.setItem("challenge", challenge);
			})
			.catch((e) => {
				console.error("failed to fetch challenge", e);
			});
	}, []);

	return { signUp: methods.handleSubmit(signUp), ...methods };
};

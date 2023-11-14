import { type Base64URLString } from "webauthn-zod";
import { useZodForm } from "@memewar/app/hooks/use-zod-form";
// import { AsciiString, asciiToBase64UrlString } from "@memewar/utils/base64-url";
import { getBaseUrl } from "@memewar/utils/get-base-url";
import { getHostname } from "@memewar/utils/get-hostname";
import { useCallback, useEffect } from "react";
import { usernameFormSchema } from "./auth.signup.form.schema";
import { useConnect } from "wagmi";
import { useToastController } from "@memewar/design-system";
import { generateChallenge } from "@memewar/utils/generate-challenge";
import { getPasskeyConnector } from "@memewar/utils/get-passkey-connector";
import { connectPasskey } from "../../hooks/use-auto-connect";

export const useSignUpForm = () => {
	const { connect } = useConnect();
	const { show: toast } = useToastController();

	const methods = useZodForm({ schema: usernameFormSchema });

	const signUp = useCallback<Parameters<typeof methods["handleSubmit"]>[0]>(
		async ({ username }) => {
			console.log("username", username);
			console.log("hostname", getHostname());
			console.log("baseUrl", getBaseUrl());
			try {
				await connectPasskey({ connect, username });
			} catch (e) {
				toast((e as Error).message);
			}
		},
		[connect, toast],
	);

	// - on mount init a challenge
	useEffect(() => {
		// tODO: only do this if we do not have a session / redirect if the user has a session
		generateChallenge().catch((e) => {
			console.error("failed to fetch challenge", e);
		});
	}, []);

	return { signUp: methods.handleSubmit(signUp), ...methods };
};

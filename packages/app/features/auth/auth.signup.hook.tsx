import { type Base64URLString } from "webauthn-zod";
import { useZodForm } from "@memewar/app/hooks/use-zod-form";
// import { AsciiString, asciiToBase64UrlString } from "@memewar/utils/base64-url";
import { getBaseUrl } from "@memewar/utils/get-base-url";
import { getHostname } from "@memewar/utils/get-hostname";
import { useCallback, useEffect } from "react";
import { usernameFormSchema } from "./auth.signup.form.schema";
import { useConnect } from "wagmi";
import { getPasskeyWalletClient } from "@memewar/app/lib/large-blob-account";
import { useToastController } from "@memewar/design-system";
import { defaultChainId, getChainAndTransport } from "@memewar/app/lib/wagmi";
import { getAlchemyProvider } from "@memewar/app/lib/alchemy";
import { passkeyConnector } from "@forum/passkeys/packages/passkeys";
import { WalletClientSigner } from "@alchemy/aa-core";
import { generateChallenge } from "@memewar/utils/generate-challenge";

export const useSignUpForm = () => {
	const { connect } = useConnect();
	const { show: toast } = useToastController();

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

			try {
				const { chain } = getChainAndTransport(defaultChainId);

				const walletClient = await getPasskeyWalletClient({
					username,
					chainId: chain.id,
				});
				console.log("after walletClient", await walletClient.getAddresses());

				/** A largeBlob passkey *CAN* more than more signer that will sign in a single verification
				 * is this something we want to add?
				 *
				 * Accounts could have both EOA & R1 signers that (under certain conditions?) could both be required
				 * with no difference to UX.
				 *
				 */
				const signer = new WalletClientSigner(
					walletClient,
					"largeBlob-passkey-signer",
				);
				const provider = getAlchemyProvider({ signer, chain });
				connect(
					{
						connector: (parameters) => {
							const connectorFn = passkeyConnector({ signer, chain, provider });
							try {
								return connectorFn(parameters);
							} catch (e) {
								console.error("connectorFn error", e);
								throw e;
							}
						},
					},
					{
						onSuccess: (...args) =>
							console.log("connected passkey account", { ...args }),
						onError: (...args) => {
							console.log("failed to connect passkey account", { ...args });
							throw args[0];
						},
					},
				);
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

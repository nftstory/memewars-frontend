import {
	type Base64URLString,
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
	// authenticationExtensionsClientOutputsSchema,
	base64URLStringSchema,
} from "webauthn-zod";
import { Passkey as LargeBlobPasskey } from "@forum/passkeys/packages/passkeys";
import * as passkeys from "react-native-passkeys";

import { getHostname } from "@memewar/utils/get-hostname";
import { api } from "@memewar/utils/api";

import type {
	VerifiedAuthenticationResponse,
	VerifiedRegistrationResponse,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";

import * as webauthnServerActions from "webauthn-server-actions";

const hostname = getHostname();

const rp = { id: hostname, name: "bzz.store" } as const;

export class Passkey extends LargeBlobPasskey {
	constructor(
		params?: Partial<
			Pick<
				PublicKeyCredentialCreationOptionsJSON,
				"pubKeyCredParams" | "authenticatorSelection"
			>
		>,
	) {
		super({ ...params, rp });
	}

	async generateRegistrationOptions(
		options: Omit<PublicKeyCredentialCreationOptionsJSON, "challenge">,
	): Promise<PublicKeyCredentialCreationOptionsJSON> {
		// ! we already generate & check challenges server-side using the `next-auth` integration so all options should be
		// ! the challenge is created on mount and stored in localStorage so here we simply read that and pass it
		const challenge = localStorage.getItem("challenge") as
			| Base64URLString
			| undefined;
		return { ...options, challenge };
		// const response =
		// 	await webauthnServerActions.generateRegistrationOptions(options);
		// console.log("generate reg options", response);
		// if (response.validationError) throw response.validationError;
		// if (response.serverError) throw response.serverError;
		// if (!response.data) throw new Error("Failed to generate data");
		// console.log("generateRegistrationOptions", response.data);
		// return response.data;
	}

	async generateAuthenticationOptions(
		options: Omit<PublicKeyCredentialRequestOptionsJSON, "challenge">,
	): Promise<PublicKeyCredentialRequestOptionsJSON> {
		return await webauthnServerActions.generateAuthenticationOptions(options);
	}

	async verifyAuthentication(
		options: VerifyAuthenticationResponseOpts,
	): Promise<VerifiedAuthenticationResponse> {
		return await webauthnServerActions.verifyAuthentication(options);
	}

	async verifyRegistration(
		options: VerifyRegistrationResponseOpts,
	): Promise<VerifiedRegistrationResponse> {
		console.log("verifyRegistration - options", options);
		const challenge = localStorage.getItem("challenge") as
			| Base64URLString
			| undefined;
		const csrfToken = localStorage.getItem("csrfToken");

		if (!challenge || !csrfToken)
			throw new Error("Could not find challenge or token");

		// ! at this point the first passkey interaction will already be complete and so the username should be held in storage
		// ! this is really coming from the LargeBlobPasskeyAccount, so there is some indirection here which isn't great
		// ! easiest thing to do for now is to just pull the username out of storage and remember to json parse it
		const unparsedUsername = localStorage.getItem(
			"passkey-storage.account-username",
		);

		if (!unparsedUsername) throw new Error("Could not find username");

		const username = JSON.parse(unparsedUsername) as string;

		console.log("verifyRegistration - username", username);
		const res = await api
			.url("/auth/callback/credentials/")
			.post({ username, csrfToken, ...options.response })
			.res();

		console.log("verifyRegistration - res", res);
		if (!res || !res.ok) {
			console.log("failed to post credentials", res);
			throw new Error("Failed to create credentials");
		}
		// const response = await webauthnServerActions.verifyRegistration(options);
		// if (response.validationError) throw response.validationError;
		// if (response.serverError) throw response.serverError;
		// if (!response.data) throw new Error("Failed to generate data");
		// console.log("verifyRegistration", response.data);
		// return response.data;
	}

	// TODO: move the next-auth verification stuff into the verify functions so that these functions are single purpose
	async create(
		passedOptions: Omit<PublicKeyCredentialCreationOptionsJSON, "rpId">,
	): Promise<RegistrationResponseJSON | null> {
		console.log("passedOptions", passedOptions);
		const { extensions: passedExtensions } = passedOptions;
		// ! For now since it is now used & there is an error in the passkeys lib we remove the credProps extension option
		const { credProps, ...extensions } = passedExtensions;
		const options = {
			...passedOptions,
			rp: this.rp,
			authenticatorSelection: {
				...this.authenticatorSelection,
				...passedOptions.authenticatorSelection,
			},
			extensions,
		};

		try {
			const passkeyResult = await passkeys.create(options);

			if (!passkeyResult) throw new Error("Failed to create passkey");

			return passkeyResult;
		} catch (e) {
			console.error("error", e);
			// TODO: write isPasskeyError util
			// if (isPasskeyError(e) && e.error === 'UserCancelled') {
			//     analytics.track('User Cancelled Passkey')
			//     return null
			// }
			// if (isPasskeyError(e) && e.error === 'Unknown error') {
			//     analytics.track('User Passkey Unknown Error')
			//     throw e
			// }
			return null;
		}
	}

	async get(
		options: Omit<PublicKeyCredentialRequestOptionsJSON, "rpId">,
	): Promise<AuthenticationResponseJSON | null> {
		console.log(options);
		const credential = await passkeys.get({
			...options,
			userVerification: "required",
		});

		const clientExtensionResults = credential?.clientExtensionResults ?? {};
		// 	authenticationExtensionsClientOutputsSchema.parse(
		// 		credential?.clientExtensionResults ?? {},
		// 	);

		if (!credential) return null;

		return {
			id: base64URLStringSchema.parse(credential.id),
			rawId: base64URLStringSchema.parse(credential.id),
			response: {
				clientDataJSON: base64URLStringSchema.parse(
					credential.response.clientDataJSON,
				),
				authenticatorData: base64URLStringSchema.parse(
					credential.response.authenticatorData,
				),
				signature: base64URLStringSchema.parse(credential.response.signature),
				// @ts-expect-error: // TODO: make this optional in webauthn-zod
				userHandle: credential.response.userHandle
					? base64URLStringSchema.parse(credential.response.userHandle)
					: undefined,
			},
			authenticatorAttachment: undefined,
			type: "public-key" as const,
			clientExtensionResults,
		};
	}

	// async writeBlob(
	// 	credentialId: Base64URLString,
	// 	blobData: SecretBlob,
	// 	storer: (blobData: SecretBlob) => Base64URLString = blobStorer,
	// ) {
	// 	const write = await this.get({
	// 		extensions: { largeBlob: { write: storer(blobData) } },
	// 		allowCredentials: [{ type: "public-key", id: credentialId }],
	// 	});

	// 	return write?.clientExtensionResults.largeBlob?.written;
	// }

	// async readBlob(
	// 	credentialId: Base64URLString,
	// 	parser: (blob: Base64URLString) => SecretBlob = blobParser,
	// ) {
	// 	const read = await this.get({
	// 		extensions: { largeBlob: { read: true } },
	// 		allowCredentials: [{ type: "public-key", id: credentialId }],
	// 	});

	// 	const blob = read?.clientExtensionResults.largeBlob?.blob;

	// 	if (!blob) throw new Error("No blob found");
	// 	return parser(blob as Base64URLString);
	// }
}

// export type PasskeyAuthResult = ReturnType<InstanceType<typeof LargeBlobPasskey>['signR1']>

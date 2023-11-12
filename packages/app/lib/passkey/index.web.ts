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
import { generateChallenge } from "@memewar/utils/generate-challenge";
import { api } from "@memewar/utils/api";

import type {
	VerifiedAuthenticationResponse,
	VerifiedRegistrationResponse,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";

import * as webauthnServerActions from "webauthn-server-actions";
import { base64UrlStringToBuffer, bufferToBase64UrlString } from "@memewar/utils/base64-url";

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
		let challenge = localStorage.getItem("challenge") as
			| Base64URLString
			| undefined;
		if (!challenge) {
			const generated = await generateChallenge();
			challenge = generated.challenge
			localStorage.setItem("challenge", generated.challenge);
		}

		return { ...options, challenge };
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

		const generated = await generateChallenge();
		const challenge = generated.challenge
		localStorage.setItem("challenge", generated.challenge);

		console.log('generateAuthenticationOptions', { generated })
		return { ...options, challenge };
	}

	async verifyAuthentication(
		options: VerifyAuthenticationResponseOpts,
	): Promise<VerifiedAuthenticationResponse> {
		const csrfToken = localStorage.getItem("csrfToken");

		console.log('verifyAuthentication', { options })
		const res = await api
			.url("/auth/callback/credentials/")
			.post({ csrfToken, ...options.response })
			.res();

		console.log("verifyAuth res - ", res)
		if (!res || !res.ok) {
			console.log("failed to post credentials", res);
			throw new Error("Failed to create credentials");
		}

		return {
			verified: true, authenticationInfo: {
				// @ts-ignore
				credentialID: options.response.id,
				newCounter: 0,
				userVerified: true,
				credentialDeviceType: "singleDevice",
				credentialBackedUp: false,
				origin: "",
				rpID: ''
			}
		}
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

		const res = await api
			.url("/auth/callback/credentials/")
			.post({ username, csrfToken, ...options.response })
			.res();

		if (!res || !res.ok) {
			console.log("failed to post credentials", res);
			throw new Error("Failed to create credentials");
		}

		/** 
		 * ! all that is really required to be returned here is `verified`, `response.id`, `response.credentialID` 
		 * ! `response.clientExtensionResults?.largeBlob?.supported` the library suggests this as a response since it will
		 * ! be the most common
		 *  @ts-expect-error */
		// return { verified: true, response: { id: options.response.rawId, clientExtensionResults: options.response.clientExtensionResults } }

		//

		return { verified: true, registrationInfo: { credentialID: options.response.rawId } }
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
		// ! this library is throwing a type error here?
		// const credential = await passkeys.get({ ...options, rpId: rp.id, userVerification: 'preferred' });

		const credential = await passkeyGet(options)

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

// ! this is a local implementation of the `passkeys.get` because the library is throwing an unknown error
async function passkeyGet(request: PublicKeyCredentialRequestOptionsJSON) {

	const credential = (await navigator.credentials.get({
		publicKey: {
			...request,
			extensions: {
				...request.extensions,
				largeBlob: {
					...request.extensions?.largeBlob,
					...(request.extensions?.largeBlob?.write && {
						write: base64UrlStringToBuffer(request.extensions.largeBlob.write),
					}),
				},
			},
			challenge: base64UrlStringToBuffer(request.challenge),
			allowCredentials: request.allowCredentials?.map((credential) => ({
				...credential,
				id: base64UrlStringToBuffer(credential.id),
				// TODO: remove the override when typescript has updated webauthn types
				transports: (credential.transports ?? undefined) as AuthenticatorTransport[] | undefined,
			})),
		},
	}))

	console.log("passkeys get result - ", credential)

	// TODO: remove the override when typescript has updated webauthn types
	const extensions =
		credential?.getClientExtensionResults() as AuthenticationExtensionsClientOutputs;

	const { largeBlob, ...clientExtensionResults } = extensions;

	if (!credential) return null;

	return {
		id: credential.id,
		rawId: credential.id,
		response: {
			clientDataJSON: bufferToBase64UrlString(credential.response.clientDataJSON),
			authenticatorData: bufferToBase64UrlString(credential.response.authenticatorData),
			signature: bufferToBase64UrlString(credential.response.signature),
			userHandle: credential.response.userHandle
				? bufferToBase64UrlString(credential.response.userHandle)
				: undefined,
		},
		authenticatorAttachment: undefined,
		clientExtensionResults: {
			...clientExtensionResults,
			...(largeBlob && {
				largeBlob: {
					...largeBlob,
					blob: largeBlob?.blob ? bufferToBase64UrlString(largeBlob.blob) : undefined,
				},
			}),
		},
		type: "public-key",
	};
}

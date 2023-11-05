import {
	type Base64URLString,
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from "webauthn-zod";
import { Passkey as ForumPasskey } from "@forum/passkeys/packages/passkeys";
import * as passkeys from "react-native-passkeys";

import { z } from "zod";
import { zodHexString } from "@memewar/utils/zod-eth-address";
import {
	AsciiString,
	asciiToBase64UrlString,
	base64UrlStringToAscii,
} from "@memewar/utils/base64-url";

import { getHostname } from "@memewar/utils/get-hostname";
import { api } from "@memewar/utils/api";

const hostname = getHostname();

const rp = { id: hostname, name: "Memewars" } as const;

// - define a zod schema to validate the largeblob data
const blobStorageSchema = z.object({ privateKey: zodHexString });

export type SecretBlob = z.output<typeof blobStorageSchema>;

const blobParser = (blob: Base64URLString): SecretBlob =>
	blobStorageSchema.parse(JSON.parse(base64UrlStringToAscii(blob)));

const blobStorer = (blobData: SecretBlob): Base64URLString =>
	asciiToBase64UrlString(
		JSON.stringify(blobStorageSchema.parse(blobData)) as AsciiString,
	);

// TODO: convert these to be static methods?
export class Passkey extends ForumPasskey {
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

	async create(
		passedOptions: Omit<
			PublicKeyCredentialCreationOptionsJSON,
			"rp" | "pubKeyCredParams" | "challenge"
		> & { challenge: Base64URLString; csrfToken: string } & Partial<
				Pick<PublicKeyCredentialCreationOptionsJSON, "pubKeyCredParams">
			>,
	): Promise<RegistrationResponseJSON | null> {
		const { challenge, csrfToken } = passedOptions;
		const options = {
			rp: this.rp,
			pubKeyCredParams: this.pubKeyCredParams,
			...passedOptions,
			authenticatorSelection: {
				...this.authenticatorSelection,
				...passedOptions.authenticatorSelection,
			},
		};

		const username = options.user.name.trim();

		try {
			const passkeyResult = await passkeys.create({ ...options, challenge });

			if (!passkeyResult) throw new Error("Failed to create passkey");

			const res = await api
				.url("/auth/callback/credentials/")
				.post({ username, csrfToken, ...passkeyResult })
				.res();

			if (!res || !res.ok) {
				console.log("failed to post credentials", res);
				throw new Error("Failed to create credentials");
			}

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
		options: Omit<PublicKeyCredentialRequestOptionsJSON, "rpId" | "challenge">,
	): Promise<AuthenticationResponseJSON | null> {
		console.log(options);
		return null;
	}

	async writeBlob(
		credentialId: string,
		blobData: SecretBlob,
		storer: (blobData: SecretBlob) => Base64URLString = blobStorer,
	) {
		const write = await this.get({
			extensions: { largeBlob: { write: storer(blobData) } },
			allowCredentials: [{ type: "public-key", id: credentialId }],
		});

		return write?.clientExtensionResults.largeBlob?.written;
	}

	async readBlob(
		credentialId: string,
		parser: (blob: Base64URLString) => SecretBlob = blobParser,
	) {
		const read = await this.get({
			extensions: { largeBlob: { read: true } },
			allowCredentials: [{ type: "public-key", id: credentialId }],
		});

		const blob = read?.clientExtensionResults.largeBlob?.blob;

		if (!blob) throw new Error("No blob found");
		return parser(blob as Base64URLString);
	}
}

// export type PasskeyAuthResult = ReturnType<InstanceType<typeof ForumPasskey>['signR1']>

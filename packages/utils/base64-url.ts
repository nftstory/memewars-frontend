import base64 from "@hexagon/base64";

import type { Base64URLString, Base64String } from "@forum/passkeys";

export type AsciiString = string & { __brand: "AsciiString" };

export function base64UrlStringtoBuffer(
	base64urlString: Base64URLString,
): Uint8Array {
	return new Uint8Array(base64.toArrayBuffer(base64urlString, true));
}

export function base64StringtoBuffer(
	base64urlString: Base64String,
): Uint8Array {
	return new Uint8Array(base64.toArrayBuffer(base64urlString, false));
}

export function bufferToBase64String(buffer: Uint8Array): Base64String {
	return base64.fromArrayBuffer(buffer, false) as Base64String;
}

export function bufferToBase64UrlString(buffer: Uint8Array): Base64URLString {
	return base64.fromArrayBuffer(buffer, true) as Base64URLString;
}

export function base64urlStringToBase64(
	base64urlString: Base64URLString,
): Base64String {
	return base64.fromArrayBuffer(
		base64UrlStringtoBuffer(base64urlString),
	) as Base64String;
}

export function asciiToBase64UrlString(ascii: AsciiString): Base64URLString {
	return base64.fromString(ascii, true) as Base64URLString;
}

export function base64UrlStringToAscii(
	base64urlString: Base64URLString,
): AsciiString {
	return base64.toString(base64urlString, true) as AsciiString;
}

export function isBase64(input: string): input is Base64String {
	return base64.validate(input, false);
}

export function isBase64url(input: string): input is Base64URLString {
	// biome-ignore lint/style/noParameterAssign: Trim padding characters from the string if present
	input = input.replace(/=/g, "");
	return base64.validate(input, true);
}

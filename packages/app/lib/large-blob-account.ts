import { Base64URLString } from "webauthn-zod";
import { getChainAndTransport } from "./wagmi";
import { LargeBlobPasskeyAccount } from "@forum/passkeys/packages/passkeys";
import { Passkey } from "./passkey";
import {
	type EIP1193RequestFn,
	type Transport,
	createWalletClient,
} from "viem";

const passkey = new Passkey();

export async function getPasskeyWalletClient({
	chainId,
	...rest
}: { chainId: number } & (
	| { credentialId: Base64URLString }
	| { username: string }
)) {
	const { chain, transport } = getChainAndTransport(chainId);

	const account = await LargeBlobPasskeyAccount.init({ passkey, ...rest });
	const walletName = `${
		"username" in rest ? rest.username : rest.credentialId
	} Wallet Client`;

	return createWalletClient({
		// @ts-expect-error: still need to implement signMessage & signTypedData
		account,
		chain,
		// @ts-ignore
		transport: (chain) => {
			const tport = transport(chain);
			return {
				...tport,
				request: async ({
					method,
					params,
				}: Parameters<EIP1193RequestFn>[0]) => {
					console.log("request hack", method, params, account);
					if (method === "eth_accounts") {
						return [account.address];
					}
					return await tport.request({ method, params });
				},
			} as unknown as Transport;
		},
		name: walletName,
	});
	// .extend((client) => ({
	// 	...publicActions,
	// 	request: async ({ method, params }: Parameters<typeof client.request>) => {
	// 		console.log("request hack", methods, params);
	// 		if (method === "eth_accounts") {
	// 			return [account.address];
	// 		}
	// 		return await client.request({ method, params });
	// 	},
	// }));
}

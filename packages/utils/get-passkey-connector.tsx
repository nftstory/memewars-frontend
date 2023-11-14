import { getPasskeyWalletClient } from "@memewar/app/lib/large-blob-account";
import { defaultChainId, getChainAndTransport } from "@memewar/app/lib/wagmi";
import { getAlchemyProvider } from "@memewar/app/lib/alchemy";
import { passkeyConnector } from "@forum/passkeys/packages/passkeys";
import { WalletClientSigner } from "@alchemy/aa-core";
import type { SetOptional } from "type-fest";

const LARGEBLOB_WALLET_SIGNER_TYPE = "largeBlob-passkey-signer";

export const getPasskeyConnector = async (
	params: SetOptional<Parameters<typeof getPasskeyWalletClient>[0], "chainId">,
) => {
	const { chainId = defaultChainId } = params;
	const { chain } = getChainAndTransport(chainId);

	if (!chain?.id) throw new Error("Chain not found");

	const walletClient = await getPasskeyWalletClient({
		...params,
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
		LARGEBLOB_WALLET_SIGNER_TYPE,
	);

	const provider = getAlchemyProvider({ signer, chain });

	return passkeyConnector({ signer, chain, provider });
};

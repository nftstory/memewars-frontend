import { getSenderAddress } from "permissionless/actions";
import {
	PublicClient,
	WalletClient,
	concat,
	encodeFunctionData,
	encodePacked,
	hexToBigInt,
	keccak256,
	type Address,
} from "viem";

type PublicKey = [bigint, bigint];

// TODO: update supported entry points
const SUPPORTED_ENTRYPOINTS = [
	"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
] as const;

// TODO: update to an actual implementation addr
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
	"0x9406Cc6185a346906296840746125a0E44976454";

const SIMPLE_ACCOUNT_FACTORY_CREATE_ACCOUNT_ABI = [
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "salt", type: "uint256" },
		],
		name: "createAccount",
		outputs: [{ name: "ret", type: "address" }],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

interface InitAccountArgs {
	factoryAddress: Address;
	// ! update to be the CounterfactualPasskeyWalletClient - which should also encompass the publicKey & signer address
	owner: WalletClient;
	publicClient: PublicClient;
	entrypoint?: Address;
}

const getCreateAccountFunctionData = (address: Address, salt: bigint) =>
	encodeFunctionData({
		abi: SIMPLE_ACCOUNT_FACTORY_CREATE_ACCOUNT_ABI,
		args: [address, salt],
	});

/**
 * @description A function that creates a salt using the public key of the inited passkey. This allows us to uniquely
 * link the account to the users passkey.
 *
 * This publicKey **is distinct** from the users largeBlob EOA public key (which is used to sign transactions)
 */
export const getAccountSalt = (publicKey: PublicKey) =>
	hexToBigInt(keccak256(encodePacked(["uint256[2]"], [publicKey])), {
		size: 32,
	});

/**
 * @description A function that creates a salt using the public key of the inited passkey. This allows us to uniquely
 * link the account to the users passkey.
 *
 * This publicKey **is distinct** from the users largeBlob EOA public key (which is used to sign transactions)
 */
export const getAccountInitCode = ({
	address,
	publicKey,
	factoryAddress = SIMPLE_ACCOUNT_FACTORY_ADDRESS,
}: Pick<InitAccountArgs, "factoryAddress" | "entrypoint"> & {
	// TODO: remove these once they exist on the owner account
	address: Address;
	publicKey: PublicKey;
}) =>
	concat([
		factoryAddress,
		getCreateAccountFunctionData(address, getAccountSalt(publicKey)),
	]);

export const isAccountDeployed = async (
	accountAddress: Address,
	publicClient: PublicClient,
) => {
	const contractCode = await publicClient.getBytecode({
		address: accountAddress,
	});

	if ((contractCode?.length ?? 0) > 2) return true;

	return false;
};

const getAccountAddress = async ({
	factoryAddress,
	owner,
	publicClient,
	entrypoint = SUPPORTED_ENTRYPOINTS[0],
}: InitAccountArgs): Promise<Address | null> => {
	if (!owner.account?.address) return null;

	const initCode = getAccountInitCode({
		factoryAddress,
		address: owner.account.address,
		publicKey: [0n, 0n],
	});

	// @ts-expect-error
	return await getSenderAddress(publicClient, {
		initCode,
		entryPoint: entrypoint,
	});
};

export const getInitCode = async (args: InitAccountArgs) => {
	const accountAddress = await getAccountAddress(args);

	const { factoryAddress, publicClient, owner } = args;

	if (!accountAddress || !owner.account?.address)
		throw new Error("Account address not found");

	if (await isAccountDeployed(accountAddress, publicClient)) return "0x";

	return getAccountInitCode({
		factoryAddress,
		// ! this should be the signer of the account ... i.e. the largeBlob EOA account
		address: owner.account.address,
		publicKey: [0n, 0n],
	});
};

import {
	http,
	createConfig,
	createStorage,
	noopStorage,
	Connector,
} from "wagmi";
import { Chain, baseGoerli as baseGoerli_ } from "wagmi/chains";
import { Address, defineChain } from "viem";
import superjson from "superjson";
import { ConnectorData } from "@alchemy/aa-core";

type ChainIdString = string;

interface AlchemyApiKey {
	/**
	 * The alchemy api key for the chain
	 */
	key: string;
	/**
	 * The alchemy chain name e.g. base-goerli
	 */
	name: string;
}

// - define alchemy baseGoerli chain

const ALCHEMY_API_KEYS = (
	process.env.NEXT_PUBLIC_ALCHEMY_API_KEYS
		? JSON.parse(process.env.NEXT_PUBLIC_ALCHEMY_API_KEYS)
		: {}
) as Record<ChainIdString, AlchemyApiKey>;

// ! any other chains should be added to the env var (which should be JSON)
const getAlchemyChainUrl = (id: number) => {
	const alchemyChain: AlchemyApiKey | undefined =
		ALCHEMY_API_KEYS?.[String(id)];
	if (alchemyChain)
		return `https://${alchemyChain.name}.g.alchemy.com/v2/${alchemyChain.key}`;
};

const baseGoerliRpcUrl = getAlchemyChainUrl(baseGoerli_.id);

if (!baseGoerliRpcUrl) throw new Error("Alchemy baseGoerli RPC URL not found");

// - override necessary because of how alchemy is checking for rpcUrls
// - we need to provide an 'alchemy' key in the `rpcUrls` field
// TODO: remove this when alchemy upgrade to wagmi v2
// @ts-ignore
export const baseGoerli = defineChain({
	...baseGoerli_,
	rpcUrls: {
		...baseGoerli_.rpcUrls,
		alchemy: {
			http: [baseGoerliRpcUrl],
			webSocket: [baseGoerliRpcUrl?.replace("https", "wss")],
		},
	},
});

export const supportedChains = { [baseGoerli.id]: baseGoerli } as const;

export const chains = Object.values(supportedChains) as unknown as [
	Chain,
	...Chain[],
];

const transports = Object.fromEntries(
	Object.keys(supportedChains).map((id) => {
		const alchemyChainRpcUrl = getAlchemyChainUrl(id as unknown as number);

		const rpcUrl = http(alchemyChainRpcUrl || undefined);

		return [id, rpcUrl];
	}),
);

export const config = createConfig({
	chains,
	transports,
	storage: createStorage({
		storage:
			typeof window !== "undefined" && window.localStorage
				? window.localStorage
				: noopStorage,

		serialize: (value) => {
			// TODO: move handling of provider serialisation into provider class itself
			if (
				value &&
				typeof value === "object" &&
				"state" in value &&
				value.state &&
				typeof value.state === "object" &&
				"connections" in value.state
			) {
				const connectionMap = value.state.connections as Map<
					string,
					{ chainId: number; accounts: Address[]; connector: Connector }
				>;
				const connectorData = connectionMap.entries();
				const connectorStorageMap = new Map();

				for (const [key, { accounts, chainId, connector }] of connectorData) {
					if (connector.id === "4337-passkey") {
						/**
						 * The provider cannot be serialised & all we need to reinit the connector is the signer & chainId
						 * as the rest can be reconstructed from these
						 *
						 * @ts-expect-error: we are pulling these directly off the class */
						const { provider: _, signer } = connector;

						connectorStorageMap.set(key, {
							chainId,
							accounts,
							connector: signer,
						});
						continue;
					}
					connectorStorageMap.set(key, connector);
				}

				console.log(
					"serialized value -",
					superjson.stringify(connectorStorageMap),
				);
				return superjson.stringify(connectorStorageMap);
			}
			console.log("serialized value -", superjson.stringify(value));
			return superjson.stringify(value);
		},

		deserialize: (value) => {
			console.log("deserializing value -", value);
			console.log("deserialized value -", superjson.parse(value));
			return superjson.parse(value);
		},
	}),
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}

// - helpers

type SupportedChainId = keyof typeof supportedChains;

function isSupportedChain(chainId: number): chainId is SupportedChainId {
	if (!(chainId in supportedChains)) return false;
	return true;
}

export function getChainAndTransport(id: number) {
	if (!isSupportedChain(id)) throw new Error(`Unsupported chainId: ${id}`);
	return { chain: supportedChains[id], transport: transports[id] };
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const defaultChainId = chains.at(0)!.id;

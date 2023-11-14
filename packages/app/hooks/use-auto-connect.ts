import { useEffect } from "react";
import {
	useAccount,
	useAccountEffect,
	useConnect,
	useConnectorClient,
} from "wagmi";
import { useSession } from "./use-session";
import { useQueryClient } from "@tanstack/react-query";
import { Base64URLString } from "webauthn-zod";
import { getPasskeyConnector } from "@memewar/utils/get-passkey-connector";
import { useRouter } from "solito/navigation";

const analytics = {
	track(...args) {
		console.log("analytics track", ...args);
	},
	identify(...args) {
		console.log("analytics identify", ...args);
	},
	people: {
		setOnce(...args) {
			console.log("analytics people setOnce", ...args);
		},
	},
};

export function useAutoConnect() {
	const { data: session, update } = useSession();
	const queryClient = useQueryClient();
	const { isConnected } = useAccount();
	const { connect } = useConnect();
	const router = useRouter();

	useEffect(() => {
		const credentialId = localStorage.getItem(
			// TODO: get from the passkey library as a const
			"passkey-storage.account-credentialId",
		) as Base64URLString | undefined;

		if (session && !isConnected) {
			// update(null).then(() => {
			// 	router.push("/");
			// });
		}

		// if (session && !isConnected && credentialId) {
		// 	connectPasskey({ connect, credentialId });
		// }
	}, [session, isConnected]);

	useAccountEffect({
		onConnect({ address, isReconnected, connector }) {
			analytics.track("Account Successfully Connected", {
				address,
				isReconnected,
				connector,
			});
			if (!address) return;
			analytics.identify(address);
			if (!isReconnected)
				analytics.people.setOnce({
					"First Connected Date": new Date(),
					"Connector Type": connector?.name,
				});
		},
		onDisconnect() {
			analytics.track("Disconnected Account");
		},
	});
}

export const connectPasskey = async ({
	connect,
	...rest
}: Pick<ReturnType<typeof useConnect>, "connect"> &
	Parameters<typeof getPasskeyConnector>[0]) => {
	const challenge = localStorage.getItem("challenge") as
		| Base64URLString
		| undefined;
	const csrfToken = localStorage.getItem("csrfToken");

	if (!challenge || !csrfToken)
		throw new Error("Could not find challenge or token");

	connect(
		{ connector: await getPasskeyConnector(rest) },
		{
			onSuccess: (...args) =>
				console.log("connected passkey account", { ...args }),
			onError: (...args) => {
				console.log("failed to connect passkey account", { ...args });
				throw args[0];
			},
		},
	);
};

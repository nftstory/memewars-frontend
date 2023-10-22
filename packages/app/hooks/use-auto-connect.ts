import { useEffect } from "react";
import { useAccount, useAccountEffect, useConnect } from "wagmi";
import { useSession } from "./use-session";

// biome-ignore lint/suspicious/noExplicitAny: // TODO: implement me
const analytics = {} as any;

export function useAutoConnect() {
	const { data: session } = useSession();
	const { isConnected } = useAccount();
	const { connect } = useConnect();

	useEffect(() => {
		if (!isConnected && session?.user?.username)
			console.log("session", session?.user?.username);
		// connectWithPasskey({ username: session?.user?.username});
	}, [isConnected, session?.user]);

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

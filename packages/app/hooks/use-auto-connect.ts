import { useEffect } from "react";
import { useAccount, useAccountEffect, useConnect } from "wagmi";
import { useSession } from "./use-session";


export function useAutoConnect() {
	const { data: session } = useSession();

	// useAccountEffect({
	// 	onConnect({ address, isReconnected, connector }) {
	// 		analytics.track("Account Successfully Connected", {
	// 			address,
	// 			isReconnected,
	// 			connector,
	// 		});
	// 		if (!address) return;
	// 		analytics.identify(address);
	// 		if (!isReconnected)
	// 			analytics.people.setOnce({
	// 				"First Connected Date": new Date(),
	// 				"Connector Type": connector?.name,
	// 			});
	// 	},
	// 	onDisconnect() {
	// 		analytics.track("Disconnected Account");
	// 	},
	// });
}

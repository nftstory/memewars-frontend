import { IS_DEV } from "@memewar/app/constants";
import { config } from "@memewar/app/lib/wagmi";
import { QueryProvider } from "@memewar/app/provider/query";
import { SafeAreaProvider } from "@memewar/app/provider/safe-area";
import { TamaguiProvider } from "@memewar/app/provider/tamagui";
import { CustomToast, ToastProvider } from "@memewar/design-system";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "./session";
import { ToastViewport } from "./toast-viewport";
import { useAutoConnect } from "../hooks/use-auto-connect";

export function Provider({ children }: React.PropsWithChildren) {
	return (
		<SafeAreaProvider>
			<TamaguiProvider>
				<SessionProvider>
					<WagmiProvider config={config}>
						<QueryProvider>
							<ToastProvider
								swipeDirection="horizontal"
								duration={6000}
								native={["mobile"]}
							>
								<InnerProvider>{children}</InnerProvider>

								<CustomToast />

								<ToastViewport />
							</ToastProvider>

							{IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
						</QueryProvider>
					</WagmiProvider>
				</SessionProvider>
			</TamaguiProvider>
		</SafeAreaProvider>
	);
}

// - a place to put app level hooks that need to run within the query/wagmi providers
const InnerProvider = ({ children }: React.PropsWithChildren) => {
	useAutoConnect();

	return <>{children}</>;
};

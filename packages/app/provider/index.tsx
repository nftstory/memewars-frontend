import { CustomToast, ToastProvider } from "@memewar/design-system";

import { IS_DEV } from "@memewar/app/constants";
import { queryClient } from "@memewar/app/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import React from "react";
import { ToastViewport } from "./toast-viewport";
import { TamaguiProvider } from "@memewar/app/provider/tamagui";
import { SafeAreaProvider } from "@memewar/app/provider/safe-area";
import { SessionProvider } from "./session";

export function Provider({ children }: React.PropsWithChildren) {
	return (
		<SafeAreaProvider>
			<TamaguiProvider>
				<SessionProvider>
					<QueryClientProvider client={queryClient}>
						<ToastProvider
							swipeDirection="horizontal"
							duration={6000}
							native={["mobile"]}
						>
							{children}

							<CustomToast />

							<ToastViewport />
						</ToastProvider>

						{IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
					</QueryClientProvider>
				</SessionProvider>
			</TamaguiProvider>
		</SafeAreaProvider>
	);
}

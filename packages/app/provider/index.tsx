import {
	CustomToast,
	TamaguiProvider,
	TamaguiProviderProps,
	ToastProvider,
} from "@memewar/design-system";
import { useColorScheme } from "react-native";

import { IS_DEV } from "@memewar/app/constants";
import { queryClient } from "@memewar/app/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ToastViewport } from "./toast-viewport";
import config from "../tamagui.config";
import React from "react";

export function Provider({
	children,
	...rest
}: Omit<TamaguiProviderProps, "config">) {
	const scheme = useColorScheme();
	return (
		<TamaguiProvider
			config={config}
			disableInjectCSS
			defaultTheme={scheme === "dark" ? "dark" : "light"}
			{...rest}
		>
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
		</TamaguiProvider>
	);
}

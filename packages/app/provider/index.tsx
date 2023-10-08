import {
	CustomToast,
	TamaguiProvider,
	TamaguiProviderProps,
	ToastProvider,
} from "@memewar/design-system";
import { useColorScheme } from "react-native";

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
			<ToastProvider
				swipeDirection="horizontal"
				duration={6000}
				native={["mobile"]}
			>
				{children}

				<CustomToast />
				<ToastViewport />
			</ToastProvider>
		</TamaguiProvider>
	);
}

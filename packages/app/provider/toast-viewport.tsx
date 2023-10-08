import React from "react";
import { ToastViewport as BaseToastViewport } from "@memewar/design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ToastViewport = () => {
	const { top, right, left } = useSafeAreaInsets();
	return <BaseToastViewport top={top + 5} left={left} right={right} />;
};

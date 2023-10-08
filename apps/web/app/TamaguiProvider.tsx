"use client";

import "@tamagui/core/reset.css";
import "@tamagui/polyfill-dev";

import { config as configBase } from "@tamagui/config/v2";
import { NextThemeProvider, useRootTheme } from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import React from "react";
import { StyleSheet } from "react-native";
import { createTamagui, TamaguiProvider as BaseTamaguiProvider } from "tamagui";

import Tamagui from "../tamagui.config";

const config = createTamagui({
	...configBase,
	themeClassNameOnRoot: false,
});

export type Conf = typeof config;

declare module "tamagui" {
	// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
	interface TamaguiCustomConfig extends Conf {}
}

export const TamaguiProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [theme, setTheme] = useRootTheme();

	useServerInsertedHTML(() => {
		// @ts-ignore
		const rnwStyle = StyleSheet.getSheet();
		return (
			<>
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{ __html: rnwStyle.textContent }}
					id={rnwStyle.id}
				/>
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: Tamagui.getCSS({
							// if you are using "outputCSS" option, you should use this "exclude"
							// if not, then you can leave the option out
							exclude:
								process.env.NODE_ENV === "production" ? "design-system" : null,
						}),
					}}
				/>
			</>
		);
	});

	return (
		<NextThemeProvider
			onChangeTheme={(next) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				setTheme(next as any);
			}}
		>
			<BaseTamaguiProvider
				config={config}
				themeClassNameOnRoot
				defaultTheme={theme}
			>
				{children}
			</BaseTamaguiProvider>
		</NextThemeProvider>
	);
};

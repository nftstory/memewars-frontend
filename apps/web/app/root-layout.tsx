"use client";

import { Audiowide } from "next/font/google";
import { insertFont } from "tamagui";
import { TamaguiProvider } from "./TamaguiProvider";

const audiowide = Audiowide({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-audiowide",
	weight: "400",
});

// ! auto-setting of tamagui fonts not working for audiowide so setting manually
insertFont("body", {
	family: `${audiowide.style.fontFamily}, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
	weight: { 6: "400" },
	size: { 6: 15 },
});
insertFont("heading", {
	family: `${audiowide.style.fontFamily}, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
	weight: { 6: "400" },
	size: { 6: 15 },
});

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${audiowide.variable}`}>
			<body>
				<TamaguiProvider>{children} </TamaguiProvider>
			</body>
		</html>
	);
}

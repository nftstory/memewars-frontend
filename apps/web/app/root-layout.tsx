"use client";

import { Audiowide } from "next/font/google";
import { insertFont, isWebTouchable } from "tamagui";
import { Provider } from "@memewar/app/provider";

const audiowide = Audiowide({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-audiowide",
	weight: "400",
});

const audiowideFont = {
	family: `${audiowide.style.fontFamily}, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
	weight: { 6: "400" },
	size: {
		6: 16,
		7: 18,
		8: 24,
		9: 40,
	},
} as const;

// ! auto-setting of tamagui fonts not working for audiowide so setting manually
insertFont("body", audiowideFont);
insertFont("heading", audiowideFont);

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${audiowide.variable}`}>
			<body
				{...(isWebTouchable && {
					style: {
						maxHeight: "100dvh",
						overflow: "hidden",
						touchAction: "none",
					},
				})}
			>
				<Provider>{children}</Provider>
			</body>
		</html>
	);
}

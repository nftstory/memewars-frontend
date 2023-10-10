import React from "react";
import TabBar from "./tabs.bar";
import TabsHeader from "./tabs.header";
import { YStack, tokens } from "@memewar/design-system";

export default function TabLayout({ children }: React.PropsWithChildren) {
	return (
		<YStack backgroundColor={tokens.color.background} flex={1}>
			<TabsHeader />
			{children}
			<TabBar />
		</YStack>
	);
}

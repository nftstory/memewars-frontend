import { YStack, tokens } from "@memewar/design-system";
import React from "react";
import TabBar from "./tabs.bar";
import TabsHeader from "./tabs.header";

export default function TabLayout({ children }: React.PropsWithChildren) {
	return (
		<YStack
			backgroundColor={tokens.color.background}
			height={"100vh"}
			maxHeight={"100dvh"}
		>
			<TabsHeader />
			{children}
			<TabBar />
		</YStack>
	);
}

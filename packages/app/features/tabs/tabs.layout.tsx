import React from "react";
import TabBar from "./tabs.bar";
import TabsHeader from "./tabs.header";
import {
	tokens,
	isWebTouchable,
	YStack,
	ScrollView,
} from "@memewar/design-system";

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

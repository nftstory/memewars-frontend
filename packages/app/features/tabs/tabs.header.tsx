import { XStack, H1, tokens } from "@memewar/design-system";
import React from "react";

export default function TabsHeader() {
	return (
		<XStack backgroundColor={tokens.color.backgroundSecondary} padding="$2">
			<H1 fontSize={24}>memewar.army</H1>
		</XStack>
	);
}

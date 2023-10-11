import {
	SizableText,
	Tabs,
	tokens,
	XStack,
	YStack,
} from "@memewar/design-system";
import { useRouter } from "@memewar/app/hooks/use-router";
import React from "react";

import { ArrowUpRight, PlusCircle, Smile } from "@tamagui/lucide-icons";

// ! ensure that key matches the route to navigate to
const TABS = [
	{
		Icon: ArrowUpRight,
		title: "Trending",
		key: "trending",
	},
	{
		Icon: PlusCircle,
		title: "Create",
		key: "create",
	},
	{
		Icon: Smile,
		title: "Profile",
		key: "profile",
	},
];

export default function TabBar() {
	return (
		<XStack width="100%" zIndex={1} backgroundColor="$backgroundSecondary">
			<HorizontalTabs />
		</XStack>
	);
}

const HorizontalTabs = () => {
	const router = useRouter();
	return (
		<Tabs
			defaultValue={TABS[0].key}
			flex={1}
			orientation="horizontal"
			flexDirection="column"
			overflow="hidden"
			backgroundColor={tokens.color.background}
		>
			<Tabs.List
				// separator={<Separator vertical borderColor={tokens.color.black} />}
				disablePassBorderRadius="bottom"
				aria-label="Navigation Tabs"
			>
				{TABS.map(({ key, Icon, title }) => (
					<Tabs.Tab
						backgroundColor={"transparent"}
						flex={1}
						borderRadius={0}
						value={key}
						key={key}
						borderWidth={"$0.25"}
						borderColor={tokens.color.black}
						flexDirection="column"
						minHeight={64}
						onPress={() => router.push(`/${key}`)}
					>
						<YStack>
							<Icon size={40} strokeWidth={1} />
						</YStack>
						<SizableText
							fontFamily="$body"
							textTransform="uppercase"
							fontSize={14}
						>
							{title}
						</SizableText>
					</Tabs.Tab>
				))}
			</Tabs.List>
		</Tabs>
	);
};

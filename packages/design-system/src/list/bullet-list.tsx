import React from "react";
import { Text, tokens, XStack, YStack } from "@memewar/design-system";

export const BulletList = ({
	data,
	bullet = "\u2022",
	...rest
}: { data: string[]; bullet?: string } & React.ComponentProps<
	typeof YStack
>) => {
	return (
		<YStack space={"$2"} {...rest}>
			{data.map((item, index) => {
				return (
					<XStack key={`unordered-list-${index}`}>
						<Text
							borderColor={tokens.color.background}
							borderLeftWidth={"$1"}
							paddingLeft={"$1"}
						>
							{bullet}
						</Text>

						<Text style={{ flex: 1, paddingLeft: 5 }}>{item}</Text>
					</XStack>
				);
			})}
		</YStack>
	);
};

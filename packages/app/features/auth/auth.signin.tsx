import React from "react";
import { Button, H1, Image, tokens, YStack } from "@memewar/design-system";

export default function SignIn() {
	return (
		<YStack
			flex={1}
			justifyContent="center"
			alignItems="center"
			backgroundColor={tokens.color.background}
		>
			<YStack
				space="$6"
				padding="$5"
				borderRadius="$1"
				maxWidth={360}
				backgroundColor={tokens.color.white}
			>
				<H1 fontSize={36} textAlign="center">
					memewar.army
				</H1>
				<YStack paddingHorizontal="$6" space="$6">
					<Button
						variant="outlined"
						size={"$5"}
						borderColor={tokens.color.input}
					>
						Sign In
					</Button>
				</YStack>
			</YStack>
		</YStack>
	);
}

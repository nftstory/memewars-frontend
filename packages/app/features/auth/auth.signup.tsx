import React from "react";
import {
	Button,
	H1,
	Paragraph,
	Form,
	Image,
	tokens,
	YStack,
	Input,
	Text,
} from "@memewar/design-system";

export default function SignUp() {
	return (
		<YStack
			flex={1}
			justifyContent="center"
			alignItems="center"
			backgroundColor={tokens.color.background}
			padding="$8"
		>
			<Form
				onSubmit={function (): void {
					throw new Error("Function not implemented.");
				}}
			>
				<YStack space="$3" borderRadius="$1" maxWidth={360}>
					<YStack space="$2">
						<H1 fontSize={24}>Choose your name</H1>
						<Paragraph fontSize={18} color={tokens.color.textSecondary}>
							Account names are visible to others.
						</Paragraph>
					</YStack>
					<Input borderColor={tokens.color.input} borderRadius={"$1"} />
					<Form.Trigger asChild>
						<Button
							size={"$3"}
							height={"$4"}
							width={"60%"}
							backgroundColor={tokens.color.button}
							borderRadius={"$1"}
							color={tokens.color.white}
						>
							Create Account
						</Button>
					</Form.Trigger>
				</YStack>
			</Form>
			<Paragraph
				position="absolute"
				bottom={80}
				color={tokens.color.textSecondary}
				maxWidth={"80%"}
			>
				WARNING: Meme War is Alpha wallet software. Assume that any ETH put into
				the system cannot be recovered. The developers will provide no
				guarantees or refunds.
			</Paragraph>
		</YStack>
	);
}

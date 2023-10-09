import { X, Copy } from "@tamagui/lucide-icons";
import React from "react";
import { useState } from "react";
import {
	Adapt,
	Button,
	Dialog,
	Fieldset,
	Input,
	Label,
	Paragraph,
	Sheet,
	tokens,
	TooltipSimple,
	Unspaced,
	XStack,
} from "@memewar/design-system";

export const TrendingFundsDialog = () => {
	const [open, setOpen] = useState(true);

	return (
		<Dialog
			modal
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
			}}
		>
			{/* <Adapt when="sm" platform="touch">
				<Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
					<Sheet.Frame padding="$4" gap="$4">
						<Adapt.Contents />
					</Sheet.Frame>
					<Sheet.Overlay
						animation="lazy"
						enterStyle={{ opacity: 0 }}
						exitStyle={{ opacity: 0 }}
					/>
				</Sheet>
			</Adapt> */}

			<Dialog.Portal>
				<Dialog.Overlay
					key="overlay"
					animation="quick"
					opacity={0.5}
					enterStyle={{ opacity: 0 }}
					exitStyle={{ opacity: 0 }}
				/>

				<Dialog.Content
					// bordered
					borderRadius={"$1"}
					elevate
					key="content"
					animateOnly={["transform", "opacity"]}
					animation={["quick", { opacity: { overshootClamping: true } }]}
					enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
					exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
					gap="$4"
					maxWidth={"80%"}
					backgroundColor={tokens.color.background}
				>
					<Dialog.Title fontSize={"$7"}>Insufficient funds</Dialog.Title>
					<Dialog.Description fontSize={"$6"}>
						Fund your account. Deposit ETH on Base chain.
					</Dialog.Description>

					<XStack
						padding="$2"
						backgroundColor={tokens.color.backgroundTertiary}
						borderRadius="$2"
						justifyContent="space-between"
						alignItems="center"
					>
						<Paragraph wordWrap="break-word" maxWidth={"85%"}>
							0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
						</Paragraph>
						<Button size="$2" backgroundColor={"transparent"} icon={Copy} />
					</XStack>

					{/* <XStack alignSelf="flex-end" gap="$4">
						<Dialog.Close displayWhenAdapted asChild>
							<Button theme="alt1" aria-label="Close">
								Save changes
							</Button>
						</Dialog.Close>
					</XStack> */}

					<Unspaced>
						<Dialog.Close asChild>
							<Button
								position="absolute"
								top="$3"
								right="$3"
								size="$2"
								circular
								backgroundColor={tokens.color.background}
								icon={X}
							/>
						</Dialog.Close>
					</Unspaced>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
};

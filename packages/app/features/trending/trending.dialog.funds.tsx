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
	// @ts-ignore
	tokens,
	TooltipSimple,
	Unspaced,
	XStack,
} from "@memewar/design-system";
import { useAccount, useBalance } from "wagmi";

export const TrendingFundsDialog = () => {
	const [open, setOpen] = useState(true);

	const { address } = useAccount();
	const { data: balance } = useBalance({
		address,
		unit: "ether",
		query: {
			gcTime: 5 * 1000,
			staleTime: 5 * 1000,
		},
	});

	const ethValue =
		balance?.value && balance?.decimals
			? balance.value / BigInt(10 ** balance.decimals)
			: undefined;

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
					borderRadius={"$0"}
					elevate
					key="content"
					animateOnly={["transform", "opacity"]}
					animation={["quick", { opacity: { overshootClamping: true } }]}
					enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
					exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
					gap="$2.5"
					padding={"$3"}
					maxWidth={"80%"}
					backgroundColor={tokens.color.background}
				>
					<Dialog.Title fontSize={"$7"}>Insufficient funds</Dialog.Title>
					<Dialog.Description fontSize={"$6"}>
						Fund your account. Deposit ETH on Base chain.
					</Dialog.Description>

					<XStack
						paddingVertical="$2"
						paddingHorizontal="$1.5"
						backgroundColor={tokens.color.backgroundTertiary}
						justifyContent="space-between"
						alignItems="center"
					>
						<Paragraph>
							{address?.slice(0, 21)}
							{/* 0xd8dA6BF26964aF9D7eE */}
							{"\n"}
							{/* d9e03E53415D37aA96045 */}
							{address?.slice(21)}
						</Paragraph>
						<Button size="$1" backgroundColor={"transparent"} icon={Copy} />
					</XStack>

					<Paragraph color={tokens.color.textSecondary} fontSize={"$5"}>
						Current Balance {ethValue ?? "0.00"} ETH
					</Paragraph>

					<Unspaced>
						<Dialog.Close asChild>
							<Button
								position="absolute"
								top="$1.5"
								right="$1.5"
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

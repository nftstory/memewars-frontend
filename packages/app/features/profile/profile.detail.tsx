import {
	Button,
	H1,
	H2,
	Paragraph,
	XStack,
	YStack,
} from "@memewar/design-system";
import { Copy } from "@tamagui/lucide-icons";
import React from "react";
import { useParams } from "@memewar/app/hooks/use-params";
import { useLink } from "@memewar/app/hooks/use-link";
import { useToastController } from "@memewar/design-system";
import { useAccount, useBalance } from "wagmi";

export function ProfileDetailScreen() {
	const { username } = useParams<{ username: string }>();
	const { address } = useAccount();
	const { show: toast } = useToastController();

	const { data: balance } = useBalance({
		address,
		unit: "ether",
		query: {
			gcTime: 5 * 1000,
			staleTime: 5 * 1000,
		},
	});

	console.log("balance", balance);

	const ethValue =
		balance?.value && balance?.decimals
			? balance.value / BigInt(10 ** balance.decimals)
			: undefined;

	return (
		<YStack flex={1} padding={"$3"} space={"$8"} spaceDirection="vertical">
			<H1 fontSize={36}>{username}</H1>
			<YStack>
				<H2 fontSize={24}>Balance</H2>
				<Paragraph fontSize={18}>{ethValue ?? "0.00"} ETH</Paragraph>
			</YStack>
			<YStack>
				<H2 fontSize={24}>Address</H2>
				<XStack space>
					<Paragraph fontSize={18} maxWidth={"85vw"}>
						{/* 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */}
						{address}
					</Paragraph>
					<YStack height={"100%"} alignItems="center" justifyContent="center">
						<Button
							size="$1"
							backgroundColor={"transparent"}
							icon={Copy}
							onPress={() => {
								// TODO: update to use expo-clipboard
								if (address) {
									navigator.clipboard.writeText(address);
									toast("Copied Address");
								}
							}}
						/>
					</YStack>
				</XStack>
			</YStack>
		</YStack>
	);
}

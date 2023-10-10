import {
	Button,
	Paragraph,
	tokens,
	XStack,
	YStack,
} from "@memewar/design-system";
import { SolitoImage as Image } from "solito/image";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { UseFormReturn } from "react-hook-form";
import { CreateMemeForm } from "./create.form.schema";
import { Timer } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import EthCircle from "@memewar/app/components/icons/eth-circle";

export const CreateMemeInput = ({
	form,
}: { form: UseFormReturn<CreateMemeForm> }) => {
	const image = form.watch("image");

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			// tODO: ask Nicholas about desired `mediaTypes`
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			// tODO: ask Nicholas about desired `aspectRatio`
			aspect: [4, 3],
			quality: 1,
		});

		console.log(result);

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			if (uri) form.setValue("image", uri);
		}
	};

	return (
		<YStack
			alignItems="center"
			justifyContent="center"
			paddingHorizontal={"$4"}
			flex={1}
		>
			{image ? (
				<YStack space={"$2"}>
					<Pressable onPress={pickImage}>
						<YStack
							maxHeight={"100vw"}
							backgroundColor={"white"}
							width={"100vw"}
							aspectRatio={1}
						>
							<Image
								alt="chosen-meme-image"
								src={image}
								fill
								contentFit="cover"
								contentPosition="center"
								priority={true}
								style={{ aspectRatio: 1 }}
							/>
						</YStack>
					</Pressable>
					<YStack space={"$2"} marginBottom={"$4"} paddingHorizontal={"$2"}>
						<XStack alignItems="center" space={"$2"} marginVertical="auto">
							<Timer />
							<Paragraph fontSize={18} textAlign="center">
								12 hour sale
							</Paragraph>
						</XStack>
						<XStack alignItems="center" space={"$2"} marginVertical="auto">
							<Image
								alt="eth-circle-icon"
								src="/img/eth-circle.svg"
								width={20}
								height={20}
							/>
							<Paragraph fontSize={18} textAlign="center">
								0.001 ETH each ($1.60)
							</Paragraph>
						</XStack>
					</YStack>
					<Button
						onPress={() => null}
						fontSize={24}
						color={tokens.color.white}
						backgroundColor={tokens.color.button}
						marginHorizontal={"$2"}
					>
						Create meme
					</Button>
				</YStack>
			) : (
				<YStack space={"$5"} marginVertical="auto">
					<Button
						backgroundColor={tokens.color.button}
						color={tokens.color.white}
						fontSize={24}
						onPress={pickImage}
					>
						Choose Image
					</Button>

					<Paragraph fontSize={18} color={tokens.color.textSecondary}>
						By uploading, you confirm that you have permission to use this
						image.
					</Paragraph>
				</YStack>
			)}
		</YStack>
	);
};

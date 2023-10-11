import {
	Button,
	Form,
	Paragraph,
	XStack,
	YStack,
	tokens,
} from "@memewar/design-system";
import { Info, Timer } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Pressable } from "react-native";
import { SolitoImage as Image } from "solito/image";
import { CreateMemeForm } from "./create.form.schema";
import { useCreateMemeStore } from "./create.store";

export const CreateMemeReview = ({
	form,
}: { form: UseFormReturn<CreateMemeForm> }) => {
	const image = form.watch("image");
	const pickImage = useCreateMemeStore((state) => state.pickImage);
	const toggleInformationDialog = useCreateMemeStore(
		(state) => state.toggleInformationDialog,
	);

	return (
		<YStack space={"$2"}>
			<Pressable onPress={() => pickImage(form.setValue)}>
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
			<YStack>
				<Form.Trigger asChild>
					<Button
						fontSize={24}
						color={tokens.color.white}
						backgroundColor={tokens.color.button}
						marginHorizontal={"$2"}
					>
						Create meme
					</Button>
				</Form.Trigger>
				<Pressable onPress={toggleInformationDialog}>
					<XStack
						alignItems="center"
						justifyContent="center"
						space={"$2"}
						marginTop={"$2"}
					>
						<Info size={16} color={tokens.color.textSecondary} />
						<Paragraph
							fontSize={16}
							textAlign="center"
							color={tokens.color.textSecondary}
						>
							information
						</Paragraph>
					</XStack>
				</Pressable>
			</YStack>
		</YStack>
	);
};

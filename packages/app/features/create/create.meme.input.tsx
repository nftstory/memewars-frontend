import { Button, Paragraph, YStack, tokens } from "@memewar/design-system";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateMemeForm } from "./create.form.schema";

export const CreateMemeInput = ({
	form,
}: { form: UseFormReturn<CreateMemeForm> }) => {
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
				By uploading, you confirm that you have permission to use this image.
			</Paragraph>
		</YStack>
	);
};

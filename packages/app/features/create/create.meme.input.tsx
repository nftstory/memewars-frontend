import {
	Button,
	Paragraph,
	YStack,
	tokens,
	useToastController,
} from "@memewar/design-system";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateMemeForm } from "./create.form.schema";
import { useSession } from "@memewar/app/hooks/use-session";
import { useRouter } from "@memewar/app/hooks/use-router";

export const CreateMemeInput = ({
	form,
}: { form: UseFormReturn<CreateMemeForm> }) => {
	const { data: session } = useSession();
	const toast = useToastController();
	const router = useRouter();

	console.log("session", session);

	// TODO: limit gif size to 3mb for gifs
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
			const { uri, height, width } = result.assets[0];
			// TODO: do we want to store original aspect ratio?
			if (uri) form.setValue("image", uri);
		}
	};

	const onChooseImage = async () => {
		if (session) return await pickImage();
		const toastDuration = 2_000;
		setTimeout(() => {
			router.push("/auth");
		}, toastDuration);
		toast.show("You must be logged in to upload an image", {
			duration: toastDuration,
			variant: "error",
		});
	};

	return (
		<YStack space={"$5"} marginVertical="auto">
			<Button
				backgroundColor={tokens.color.button}
				color={tokens.color.white}
				fontSize={24}
				onPress={onChooseImage}
			>
				Choose Image
			</Button>

			<Paragraph fontSize={18} color={tokens.color.textSecondary}>
				By uploading, you confirm that you have permission to use this image.
			</Paragraph>
		</YStack>
	);
};

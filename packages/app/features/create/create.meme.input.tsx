import { Button, Paragraph, tokens, YStack } from "@memewar/design-system";
import React from "react";

export const CreateMemeInput = () => {
	return (
		<YStack alignItems="center" justifyContent="center" padding={"$4"} flex={1}>
			<YStack space={"$5"} marginVertical="auto">
				<Button
					backgroundColor={tokens.color.button}
					color={tokens.color.white}
					fontSize={24}
				>
					Choose Image
				</Button>
				<Paragraph fontSize={18} color={tokens.color.textSecondary}>
					By uploading, you confirm that you have permission to use this image.
				</Paragraph>
			</YStack>
		</YStack>
	);
};

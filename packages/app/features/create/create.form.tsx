import React, { useCallback } from "react";
import { CreateInfoDialog } from "./create.info.dialog";
import { CreateMemeReview } from "./create.meme.review";
import { CreateMemeInput } from "./create.meme.input";
import { Form, YStack } from "@memewar/design-system";
import { useZodForm } from "@memewar/app/hooks/use-zod-form";
import { useSession } from "@memewar/app/hooks/use-session";
import { createMemeSchema } from "./create.form.schema";
import { useCreateMemeStore } from "./create.store";

export const CreateForm = () => {
	const { data: session } = useSession();
	const { isInformationDialogOpen, toggleInformationDialog } =
		useCreateMemeStore((state) => ({
			isInformationDialogOpen: state.isInformationDialogOpen,
			toggleInformationDialog: state.toggleInformationDialog,
		}));

	const methods = useZodForm({ schema: createMemeSchema });
	const image = methods.watch("image");

	const onSubmit = useCallback(
		methods.handleSubmit((data) => {
			console.log("submit", data, session);
		}),
		[session],
	);

	return (
		<Form onSubmit={onSubmit} flex={1}>
			<YStack
				alignItems="center"
				justifyContent="center"
				paddingHorizontal={"$4"}
				flex={1}
			>
				{image ? (
					<CreateMemeReview form={methods} />
				) : (
					<CreateMemeInput form={methods} />
				)}
			</YStack>

			<CreateInfoDialog
				open={isInformationDialogOpen}
				toggleOpen={toggleInformationDialog}
			/>
		</Form>
	);
};

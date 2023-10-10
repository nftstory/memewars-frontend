import React, { useCallback } from "react";
import { CreateInfoDialog } from "./create.info.dialog";
import { CreateMemeInput } from "./create.meme.input";
import { Form } from "@memewar/design-system";
import { useZodForm } from "@memewar/app/hooks/use-zod-form";
import { createMemeSchema } from "./create.form.schema";

export const CreateForm = () => {
	const methods = useZodForm({ schema: createMemeSchema });

	const onSubmit = useCallback(
		methods.handleSubmit((data) => {}),
		[],
	);

	return (
		<Form onSubmit={onSubmit} flex={1}>
			<CreateMemeInput form={methods} />
			<CreateInfoDialog />
		</Form>
	);
};

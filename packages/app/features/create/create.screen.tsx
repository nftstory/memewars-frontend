import React from "react";
import { CreateInfoDialog } from "./create.info.dialog";
import { CreateMemeInput } from "./create.meme.input";

export const CreateScreen = () => {
	return (
		<>
			<CreateMemeInput />
			<CreateInfoDialog />
		</>
	);
};

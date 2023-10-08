import { Paragraph as BaseParagraph } from "tamagui";
import { audiowideFont, audiowideVariable } from "./fonts";

export const Paragraph = (
	props: React.ComponentProps<typeof BaseParagraph>,
	// ) => <BaseParagraph {...props} fontFamily={audiowideVariable} />;
) => <BaseParagraph {...props} />;

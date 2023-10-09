import { SolitoImage } from "solito/image";

import { styled } from "tamagui";

// @ts-expect-error
export const Image = styled(SolitoImage, { acceptsClassName: true });

export type ImageProps = React.ComponentProps<typeof Image>;

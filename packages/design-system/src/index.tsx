import { Image, ImageProps } from "./image";
import { tokens } from "./tamagui.config";

export * from "tamagui";
export * from "@tamagui/toast";
export { config } from "./tamagui.config";
export * from "./CustomToast";
export * from "./fonts";

// - favour our image over tamaguis
export { Image, tokens };
export type { ImageProps };

import { Image, ImageProps } from "./image";

export * from "tamagui";
export * from "@tamagui/toast";
export { config, tokens } from "./tamagui.config";
export * from "./CustomToast";
export * from "./fonts";

// - favour our image over tamaguis
export { Image };
export type { ImageProps };

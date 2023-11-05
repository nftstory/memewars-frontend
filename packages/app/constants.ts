import { Platform } from "react-native";

export const IS_DEV = Platform.select({
	web: process.env.NODE_ENV === "development",
	default: __DEV__,
});

export const IS_WEB = Platform.OS === "web";
export const IS_BROWSER = IS_WEB && typeof window !== "undefined";

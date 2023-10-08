import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Provider } from "@memewar/app/provider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function HomeLayout() {
	const [loaded] = useFonts({
		audiowide: require("../assets/Audiowide-Regular.ttf"),
	});
	const scheme = useColorScheme();

	if (!loaded) {
		return null;
	}
	return (
		<Provider>
			<ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack />
			</ThemeProvider>
		</Provider>
	);
}

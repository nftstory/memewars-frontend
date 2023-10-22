import React from "react";

// ! expo router wraps the app with the react-native-safe-area-context anyway
export const SafeAreaProvider = ({ children }: React.PropsWithChildren) => {
	return <>{children}</>;
};

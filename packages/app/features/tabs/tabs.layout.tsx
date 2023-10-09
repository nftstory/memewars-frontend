import React from "react";
import TabBar from "./tabs.bar";
import TabsHeader from "./tabs.header";

export default function TabLayout({ children }: React.PropsWithChildren) {
	return (
		<>
			<TabsHeader />
			{children}
			<TabBar />
		</>
	);
}

import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import { Props } from "./index.types";

// tODO: need to be able to pass in custom props here on native
export function VirtualList<T>({
	data,
	renderItem,
	itemHeight,
}: Props<T>): React.ReactNode {
	const { top, bottom } = useSafeAreaInsets();

	const render = useCallback<ListRenderItem<T>>(
		// @ts-ignore
		({ item }) => {
			return renderItem(item);
			// if (
			// 	typeof renderedItem === "string" ||
			// 	typeof renderedItem === "number" ||
			// 	typeof renderedItem === "boolean" ||
			// 	renderedItem === null ||
			// 	renderedItem === undefined
			// )
			// 	throw new Error("Cannot pass text as ReactNode in RN");
			// return renderedItem || null;
		},
		[renderItem],
	);

	return (
		<FlashList
			data={data}
			contentContainerStyle={{
				paddingTop: top,
				paddingBottom: bottom,
			}}
			renderItem={render}
			estimatedItemSize={itemHeight}
		/>
	);
}

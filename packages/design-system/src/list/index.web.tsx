import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { type Props } from "./index.types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// biome-ignore lint/complexity/noUselessTypeConstraint: <explanation>
export const VirtualList = <T extends any>({
	data,
	renderItem,
	itemHeight,
}: Props<T | undefined>): React.ReactNode => {
	const { top, bottom } = useSafeAreaInsets();

	const parentRef = useRef();
	const rowVirtualizer = useVirtualizer({
		count: data.length,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		getScrollElement: () => parentRef.current as any,
		estimateSize: () => itemHeight,
	});

	return (
		<div
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			ref={parentRef as any}
			style={{
				paddingTop: top,
				paddingBottom: bottom,
				height: "100%",
				overflow: "auto", // Make it scroll!
			}}
		>
			{/* The large inner element to hold all of the items */}
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: "100%",
					position: "relative",
				}}
			>
				{/* Only the visible items in the virtualizer, manually positioned to be in view */}
				{rowVirtualizer.getVirtualItems().map((virtualItem) => (
					<div
						key={virtualItem.key}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: `${virtualItem.size}px`,
							transform: `translateY(${virtualItem.start}px)`,
						}}
					>
						{renderItem(data[virtualItem.index])}
					</div>
				))}
			</div>
		</div>
	);
};

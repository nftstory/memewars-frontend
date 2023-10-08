import { createFont } from "tamagui";

export const audiowideVariable = {
	val: "var(--font-audiowide)",
	isVar: true,
	key: "audiowide",
	name: "audiowide",
} as const;

export const audiowideFont = createFont({
	family:
		'audiowide, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
	// family: audiowideVariable,
	size: {
		6: 15,
	},
	weight: {
		6: "400",
	},
	color: {
		6: "$colorFocus",
		7: "$color",
	},
	// letterSpacing: {
	// 5: 2,
	// 6: 1,
	// 7: 0,
	// 8: -1,
	// 9: -2,
	// 10: -3,
	// 12: -4,
	// 14: -5,
	// 15: -6,
	// },
	face: {
		400: { normal: "audiowide" },
	},
});

import { getAddress } from "viem";
import type { Hex } from "viem";
import z from "zod";

export const zodHexString = z.preprocess(
	(val) => {
		if (typeof val !== "string") return "0x";
		// biome-ignore lint/style/noParameterAssign:
		if (!val.startsWith("0x")) val = `0x${val}`;
		return val;
	},
	z.custom<Hex>((val) => new RegExp(/0x[a-f0-9]*$/, "gi").test(val as string)),
);

export const zodEthAddress = zodHexString.refine((hex) => getAddress(hex));

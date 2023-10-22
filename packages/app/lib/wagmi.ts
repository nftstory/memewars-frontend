import { http, createConfig } from "wagmi";
import { base, baseGoerli } from "wagmi/chains";

export const config = createConfig({
	chains: [
		// base,
		baseGoerli,
	],
	transports: {
		// [base.id]: http(),
		[baseGoerli.id]: http(),
	},
});

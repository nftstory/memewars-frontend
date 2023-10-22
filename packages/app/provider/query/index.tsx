import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";

export const reactQueryOptions = {
	// TODO: set up default options
	defaultOptions: {
		queries: {
			throwOnError: true,
		},
	},
} satisfies QueryClientConfig;

export const QueryProvider = ({ children }: React.PropsWithChildren) => {
	const [queryClient] = useState(() => new QueryClient(reactQueryOptions));
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

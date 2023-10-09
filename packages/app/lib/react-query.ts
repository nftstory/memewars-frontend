import { QueryClient } from "@tanstack/react-query";

export const reactQueryOptions = {
    // TODO: set up default options
    defaultOptions: {},
};

export const queryClient = new QueryClient(reactQueryOptions);
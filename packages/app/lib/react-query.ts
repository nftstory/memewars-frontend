import { QueryClient } from "@tanstack/react-query";

export const reactQueryOptions = {
    // TODO: set up default options
    defaultOptions: {},
};


// tODO: allow server side prefetching with hydration
// import { cache } from 'react'

// const getQueryClient = cache(() => new QueryClient(reactQueryOptions))

export const queryClient = new QueryClient(reactQueryOptions);
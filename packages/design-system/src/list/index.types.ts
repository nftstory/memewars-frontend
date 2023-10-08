export interface Props<T> {
    data: T[];
    renderItem: (item: T) => React.ReactNode;
    itemHeight: number;
}
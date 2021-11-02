export type Fn<T1, T2> = (props: T1) => T2
export type PromiseFn<T1, T2> = (props: T1) => Promise<T2>
export type VoidFn = () => Promise<void>

export declare type AnimationType = 'dynamic' | 'spring' | 'none';

export declare type Config = {
    animation: AnimationType;
    continuousMode: boolean;
    manualSwap: boolean;
};

export declare function createSwapy(root: Element | null, userConfig?: Partial<Config>): SwapyApi;

declare type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Keys extends keyof T ? {
    [K in Keys]: T[K];
} & Partial<Record<Exclude<keyof T, Keys>, never>> : never;

export declare type SlotItemMap = SwapEventArray;

export declare type SwapCallback = (event: SwapEventData) => void;

export declare type SwapData = RequireOnlyOne<SwapEventDataData, 'map' | 'array' | 'object'>;

export declare type SwapEventArray = Array<{
    slotId: string;
    itemId: string | null;
}>;

export declare interface SwapEventData {
    data: SwapEventDataData;
}

export declare interface SwapEventDataData {
    map: SwapEventMap;
    array: SwapEventArray;
    object: SwapEventObject;
}

export declare type SwapEventMap = Map<string, string | null>;

export declare type SwapEventObject = Record<string, string | null>;

export declare type Swapy = SwapyApi;

export declare interface SwapyApi {
    onSwap(callback: SwapCallback): void;
    enable(enabled: boolean): void;
    destroy(): void;
    setData(swapData: SwapData): void;
}

export { }

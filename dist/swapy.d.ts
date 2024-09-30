declare type AnimationType = 'dynamic' | 'spring' | 'none';

declare type Config = {
    animation: AnimationType;
    continuousMode: boolean;
    manualSwap: boolean;
    swapMode: SwapMode;
    autoScrollOnDrag: boolean;
};

export declare function createSwapy(root: Element | null, userConfig?: Partial<Config>): Swapy;

declare type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Keys extends keyof T ? {
    [K in Keys]: T[K];
} & Partial<Record<Exclude<keyof T, Keys>, never>> : never;

export declare type SlotItemMap = SwapEventArray;

declare type SwapCallback = (event: SwapEventData) => void;

declare type SwapData = RequireOnlyOne<SwapEventDataData, 'map' | 'array' | 'object'>;

declare type SwapEndCallback = (event: SwapEndEventData) => void;

declare type SwapEndEventData = SwapEventData & {
    hasChanged: boolean;
};

export declare type SwapEventArray = Array<{
    slotId: string;
    itemId: string | null;
}>;

declare interface SwapEventData {
    data: SwapEventDataData;
}

declare interface SwapEventDataData {
    map: SwapEventMap;
    array: SwapEventArray;
    object: SwapEventObject;
}

export declare type SwapEventMap = Map<string, string | null>;

export declare type SwapEventObject = Record<string, string | null>;

declare type SwapMode = 'hover' | 'stop' | 'drop';

declare type SwapStartCallback = () => void;

export declare interface Swapy {
    onSwap(callback: SwapCallback): void;
    onSwapEnd(callback: SwapEndCallback): void;
    onSwapStart(callback: SwapStartCallback): void;
    enable(enabled: boolean): void;
    destroy(): void;
    setData(swapData: SwapData): void;
}

export { }

export declare type AnimationType = 'dynamic' | 'spring' | 'none';

export declare type BeforeSwapEvent = {
    fromSlot: string;
    toSlot: string;
    draggingItem: string;
    swapWithItem: string;
};

export declare type BeforeSwapHandler = (event: BeforeSwapEvent) => boolean;

export declare type Config = {
    animation: AnimationType;
    enabled: boolean;
    swapMode: 'hover' | 'drop';
    dragOnHold: boolean;
    autoScrollOnDrag: boolean;
    dragAxis: DragAxis;
    manualSwap: boolean;
};

export declare function createSwapy(container: HTMLElement, config?: Partial<Config>): Swapy;

declare type DragAxis = 'x' | 'y' | 'both';

declare function dynamicSwapy<Item>(swapy: Swapy | null, items: Array<Item>, idField: keyof Item, slotItemMap: SlotItemMapArray, setSlotItemMap: (slotItemMap: SlotItemMapArray) => void, removeItemOnly?: boolean): void;

export declare function getClosestScrollableContainer(element: HTMLElement): HTMLElement | Window;

declare function initSlotItemMap<Item>(items: Array<Item>, idField: keyof Item): SlotItemMapArray;

export declare type SlotItemMap = {
    asObject: SlotItemMapObject;
    asMap: SlotItemMapMap;
    asArray: SlotItemMapArray;
};

export declare type SlotItemMapArray = Array<{
    slot: string;
    item: string;
}>;

export declare type SlotItemMapMap = Map<string, string>;

export declare type SlotItemMapObject = Record<string, string>;

declare type SlottedItems<Item> = Array<{
    slotId: string;
    itemId: string;
    item: Item | null;
}>;

export declare type SwapEndEvent = {
    slotItemMap: SlotItemMap;
    hasChanged: boolean;
};

export declare type SwapEndEventHandler = (event: SwapEndEvent) => void;

export declare type SwapEvent = {
    oldSlotItemMap: SlotItemMap;
    newSlotItemMap: SlotItemMap;
    fromSlot: string;
    toSlot: string;
    draggingItem: string;
    swappedWithItem: string;
};

export declare type SwapEventHandler = (event: SwapEvent) => void;

export declare type SwapStartEvent = {
    slotItemMap: SlotItemMap;
    draggingItem: string;
    fromSlot: string;
};

export declare type SwapStartEventHandler = (event: SwapStartEvent) => void;

export declare interface Swapy {
    enable(enabled: boolean): void;
    onSwapStart(handler: SwapStartEventHandler): void;
    onSwap(handler: SwapEventHandler): void;
    onSwapEnd(handler: SwapEndEventHandler): void;
    onBeforeSwap(handler: BeforeSwapHandler): void;
    slotItemMap(): SlotItemMap;
    update(): void;
    destroy(): void;
}

declare function toSlottedItems<Item>(items: Array<Item>, idField: keyof Item, slotItemMap: SlotItemMapArray): SlottedItems<Item>;

export declare namespace utils {
    export {
        toSlottedItems,
        initSlotItemMap,
        dynamicSwapy,
        SlottedItems
    }
}

export { }

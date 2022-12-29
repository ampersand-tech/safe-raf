/**
 * Copyright 2014-present Ampersand Technologies, Inc.
 */
export declare function getNow(): number;
export type AnimFrameCallback = (time?: number) => void;
export type AnimFrameUserHandle = {
    cb: AnimFrameCallback | null;
    timer?: number;
    rafID?: number;
};
export declare function requestAnimationFrame(cb: AnimFrameCallback): {
    cb: AnimFrameCallback;
};
export declare function cancelAnimationFrame(userHandle?: AnimFrameUserHandle): void;

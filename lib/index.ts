/**
 * Copyright 2014-present Ampersand Technologies, Inc.
 */

let hasRAF = false;

try {
  hasRAF = !!window.requestAnimationFrame;
} catch (ex) {
  // ignore
}

export function getNow(): number {
  let now;
  try {
    now = (window.performance && window.performance.now) ? (window.performance.now() + window.performance.timing.navigationStart) : Date.now();
  } catch (e) {
    now = Date.now();
  }
  return now;
}

export type AnimFrameCallback = (time ?: number) => void;
export type AnimFrameUserHandle = {
  cb: AnimFrameCallback | null;
  timer?: number;
  rafID?: number;
};

type AnimFrameHandler = {
  userHandles: AnimFrameUserHandle[];
  timer: number | null;
  rafID: number;
};

let gCurrentAnimationFrame: AnimFrameHandler | null = null;

function handleAnimationFrameCommon(timestamp) {
  if (!gCurrentAnimationFrame) {
    return;
  }
  let userHandles = gCurrentAnimationFrame.userHandles;
  gCurrentAnimationFrame.userHandles = [];

  if (gCurrentAnimationFrame.timer) {
    clearTimeout(gCurrentAnimationFrame.timer);
    gCurrentAnimationFrame.timer = null;
  }
  if (gCurrentAnimationFrame.rafID >= 0) {
    window.cancelAnimationFrame(gCurrentAnimationFrame.rafID);
    gCurrentAnimationFrame.rafID = -1;
  }
  gCurrentAnimationFrame = null;

  if (!userHandles.length) {
    return;
  }

  try {
    if (timestamp && window.performance && window.performance.timing) {
      timestamp += window.performance.timing.navigationStart;
    } else {
      timestamp = getNow();
    }
  } catch (_ex) {
    timestamp = getNow();
  }

  for (let i = 0; i < userHandles.length; ++i) {
    let cb = userHandles[i].cb;
    userHandles[i].cb = null;
    cb && cb(timestamp);
  }
}

function handleAnimationFrameTimeout() {
  if (!gCurrentAnimationFrame) {
    return;
  }
  gCurrentAnimationFrame.timer = null;
  handleAnimationFrameCommon(null);
}

function handleAnimationFrame(timestamp) {
  if (!gCurrentAnimationFrame) {
    return;
  }
  gCurrentAnimationFrame.rafID = -1;
  handleAnimationFrameCommon(timestamp);
}

export function requestAnimationFrame(cb : AnimFrameCallback) {
  let userHandle = {
    cb: cb,
  };

  if (gCurrentAnimationFrame) {
    gCurrentAnimationFrame.userHandles.push(userHandle);
    return userHandle;
  }

  gCurrentAnimationFrame = {
    rafID: -1,
    timer: null,
    userHandles: [userHandle],
  };

  if (hasRAF) {
    // RAF is not called if the page isn't rendering, so set a timeout to call the callback anyway
    gCurrentAnimationFrame.timer = setTimeout(handleAnimationFrameTimeout, 125);
    gCurrentAnimationFrame.rafID = window.requestAnimationFrame(handleAnimationFrame);
  } else {
    gCurrentAnimationFrame.timer = setTimeout(handleAnimationFrameTimeout, 0);
  }

  return userHandle;
}

export function cancelAnimationFrame(userHandle?: AnimFrameUserHandle): void {
  if (!userHandle) {
    return;
  }
  userHandle.cb = null;
}

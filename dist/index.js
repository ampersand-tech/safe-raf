"use strict";
/**
 * Copyright 2014-present Ampersand Technologies, Inc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var hasRAF = false;
try {
    hasRAF = !!window.requestAnimationFrame;
}
catch (ex) {
    // ignore
}
function getNow() {
    var now;
    try {
        now = (window.performance && window.performance.now) ? (window.performance.now() + window.performance.timing.navigationStart) : Date.now();
    }
    catch (e) {
        now = Date.now();
    }
    return now;
}
exports.getNow = getNow;
var gCurrentAnimationFrame = null;
function handleAnimationFrameCommon(timestamp) {
    if (!gCurrentAnimationFrame) {
        return;
    }
    var userHandles = gCurrentAnimationFrame.userHandles;
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
        }
        else {
            timestamp = getNow();
        }
    }
    catch (_ex) {
        timestamp = getNow();
    }
    for (var i = 0; i < userHandles.length; ++i) {
        var cb = userHandles[i].cb;
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
function requestAnimationFrame(cb) {
    var userHandle = {
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
    }
    else {
        gCurrentAnimationFrame.timer = setTimeout(handleAnimationFrameTimeout, 0);
    }
    return userHandle;
}
exports.requestAnimationFrame = requestAnimationFrame;
function cancelAnimationFrame(userHandle) {
    if (!userHandle) {
        return;
    }
    userHandle.cb = null;
}
exports.cancelAnimationFrame = cancelAnimationFrame;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseWithTimeout = void 0;
function promiseWithTimeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject('Promise Timeout');
        }, ms);
    });
}
exports.promiseWithTimeout = promiseWithTimeout;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUntil = void 0;
const waitUntil = (condition, checkInterval = 100) => __awaiter(void 0, void 0, void 0, function* () {
    const promise = new Promise((resolve) => {
        let interval = setInterval(() => {
            if (!condition())
                return;
            clearInterval(interval);
            resolve();
        }, checkInterval);
    });
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            reject();
        }, 3000);
    });
    return Promise.race([promise, timeout]);
});
exports.waitUntil = waitUntil;

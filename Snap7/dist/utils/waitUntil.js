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
const conn_params_1 = require("../connections/plc/s7/conn-params");
const waitUntil = (res, rej, errorMsg, checkInterval = 100) => __awaiter(void 0, void 0, void 0, function* () {
    const promise = new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            if (!res() && !rej())
                return;
            clearInterval(interval);
            if (res()) {
                resolve();
            }
            else {
                reject(errorMsg());
            }
        }, checkInterval);
    });
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            reject('Timeout');
        }, conn_params_1.s7_triggetTime * 5);
    });
    return Promise.race([promise, timeout]);
});
exports.waitUntil = waitUntil;

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
exports.s7_writeAreas = exports.s7_readAreas = void 0;
const conn_params_1 = require("../../../connections/plc/s7/conn-params");
const s7_readAreas = (s7client, multiVar) => __awaiter(void 0, void 0, void 0, function* () {
    const promise = new Promise((resolve, reject) => {
        s7client.ReadMultiVars(multiVar, (err, data) => {
            if (!err && data.every((result) => result.Result === 0))
                resolve(data);
            reject('Error during reading from PLC');
        });
    });
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            s7client.Disconnect();
            reject('Error during reading from PLC');
        }, conn_params_1.s7_triggetTime / 4);
    });
    return Promise.race([promise, timeout]);
});
exports.s7_readAreas = s7_readAreas;
const s7_writeAreas = (s7client, multiVar) => __awaiter(void 0, void 0, void 0, function* () {
    const promise = new Promise((resolve, reject) => {
        s7client.WriteMultiVars(multiVar, (err, data) => {
            if (!err && data.every((result) => result.Result === 0))
                resolve();
            reject('Error during writing to PLC');
        });
    });
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            s7client.Disconnect();
            reject('Error during writing to PLC');
        }, conn_params_1.s7_triggetTime / 4);
    });
    return Promise.race([promise, timeout]);
});
exports.s7_writeAreas = s7_writeAreas;

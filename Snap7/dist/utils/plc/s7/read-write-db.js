"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAreas = exports.readAreas = void 0;
const conn_params_1 = require("../../../connections/plc/s7/conn-params");
const readAreas = (s7client, multiVar) => {
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
};
exports.readAreas = readAreas;
const writeAreas = (s7client, multiVar) => {
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
};
exports.writeAreas = writeAreas;

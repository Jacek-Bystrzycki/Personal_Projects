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
exports.S7_DataPLC = void 0;
const snap7 = require("node-snap7");
const errors_1 = require("../../../types/server/errors");
const get_object_prop_1 = require("../../../utils/get-object-prop");
class S7_DataPLC {
    constructor() {
        this.s7_readFromPlc = (multiVar) => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.s7client.ReadMultiVars(multiVar, (err, data) => {
                    if (!err && data.every((result) => result.Result === 0))
                        resolve(data);
                    const errorDataDBValues = JSON.stringify((0, get_object_prop_1.getObjectValue)(multiVar, 'DBNumber'));
                    reject(new errors_1.InternalError(`Cannot read-write data from-to DBs:${errorDataDBValues}`));
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    this.s7client.Disconnect();
                    reject(new errors_1.InternalError(`Timeout during reading data from PLC`));
                }, 2000);
            });
            return Promise.race([promise, timeout]);
        });
        this.s7_writeToPlc = (multiVar) => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.s7client.WriteMultiVars(multiVar, (err, data) => {
                    if (!err && data.every((result) => result.Result === 0))
                        resolve();
                    const errorDataDBValues = JSON.stringify((0, get_object_prop_1.getObjectValue)(multiVar, 'DBNumber'));
                    reject(new errors_1.InternalError(`Cannot write data to DBs:${errorDataDBValues}`));
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    this.s7client.Disconnect();
                    reject(new errors_1.InternalError(`Timeout during writing data from PLC`));
                }, 2000);
            });
            return Promise.race([promise, timeout]);
        });
        this.s7client = new snap7.S7Client();
    }
}
exports.S7_DataPLC = S7_DataPLC;

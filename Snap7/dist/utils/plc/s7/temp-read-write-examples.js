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
exports.s7_write = exports.s7_read = void 0;
const __1 = require("../../..");
const conn_params_1 = require("../../../connections/plc/s7/conn-params");
const get_date_as_string_1 = require("../../get-date-as-string");
//In standard application use s7_plc.readData() and s7_plc.writeData() in express controllers instead to trigger it in setInterval!!!
const s7_read = (id, indexes) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const s7_readData = yield __1.s7_plc.readData(id, indexes);
            s7_readData.forEach((res) => console.log(res.Data));
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}Cannot read from PLC id: ${id}: ${error}`);
        }
    }), conn_params_1.s7_triggetTime);
};
exports.s7_read = s7_read;
const s7_write = (id, indexes, dataToWrite) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield __1.s7_plc.writeData(id, indexes, dataToWrite);
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}Cannot write to PLC id: ${id}: ${error}`);
        }
    }), conn_params_1.s7_triggetTime * 4.72);
};
exports.s7_write = s7_write;

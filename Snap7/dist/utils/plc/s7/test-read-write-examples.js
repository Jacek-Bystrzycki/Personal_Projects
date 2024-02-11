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
const __1 = require("../../..");
const conn_params_1 = require("../../../connections/plc/s7/conn-params");
const get_date_as_string_1 = require("../../get-date-as-string");
//In standard application use s7_plc.readData() and s7_plc.writeData() in express controllers instead to trigger it in setInterval!!!
const s7_read = (id, indexes) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const s7_readData = yield __1.s7_plc_1.s7_readData(id, indexes);
            s7_readData.forEach((res, index) => {
                const data = [...res];
                console.log(`${(0, get_date_as_string_1.getDateAsString)()}S7-Read - id ${id}, index ${indexes[index]}: [${data}]`);
            });
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}S7-Read - Cannot read from PLC id: ${id}: ${error}`);
        }
    }), conn_params_1.s7_triggetTime);
};
const s7_write = (id, indexes, dataToWrite) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield __1.s7_plc_1.s7_writeData(id, indexes, dataToWrite);
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}S7-Write - Cannot write to PLC id: ${id}: ${error}`);
        }
    }), conn_params_1.s7_triggetTime * 4.72);
};
const s7_data1 = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
const s7_data2 = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];
s7_read(1, [1, 2, 3]);
s7_read(2, [1, 2]);
s7_write(1, [1, 2], s7_data1);
s7_write(2, [1, 2], s7_data2);

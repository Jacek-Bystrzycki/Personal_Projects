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
exports.mb_write = exports.mb_read = void 0;
const __1 = require("../../..");
const get_date_as_string_1 = require("../../get-date-as-string");
//In standard application use mb_ReadFromDevice() and mb_WriteToDevice() in express controllers instead to trigger it in setInterval!!!
const mb_read = (id, regs) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield __1.mb_devices.mb_ReadFromDevice(id, regs);
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: [${data}]`);
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: ${error}`);
        }
    }), 2317);
};
exports.mb_read = mb_read;
const mb_write = (id, start, data) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield __1.mb_devices.mb_WriteToDevice(id, start, data);
        }
        catch (error) {
            console.log(`${(0, get_date_as_string_1.getDateAsString)()}MB-Write - id ${id}, registers ${start}-${start + data.length}: ${error}`);
        }
    }), 4723);
};
exports.mb_write = mb_write;

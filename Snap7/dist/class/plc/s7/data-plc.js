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
const read_write_db_1 = require("../../../utils/plc/s7/read-write-db");
class S7_DataPLC {
    constructor() {
        this.s7_readFromPlc = (multiVar) => __awaiter(this, void 0, void 0, function* () {
            return (0, read_write_db_1.s7_readAreas)(this.s7client, multiVar);
        });
        this.s7_writeToPlc = (multiVar) => __awaiter(this, void 0, void 0, function* () {
            return (0, read_write_db_1.s7_writeAreas)(this.s7client, multiVar);
        });
        this.s7client = new snap7.S7Client();
    }
}
exports.S7_DataPLC = S7_DataPLC;

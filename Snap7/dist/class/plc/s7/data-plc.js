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
exports.DataPLC = void 0;
const read_write_db_1 = require("../../../utils/plc/s7/read-write-db");
class DataPLC {
    constructor(s7client) {
        this.s7client = s7client;
        this.readFromPlc = (db, start, len) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, read_write_db_1.readDB)(this.s7client, db, start, len);
            }
            catch (error) {
                console.log(error);
            }
        });
        this.writeToPlc = (db, start, len, buffer) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, read_write_db_1.writeDB)(this.s7client, db, start, len, buffer);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.DataPLC = DataPLC;

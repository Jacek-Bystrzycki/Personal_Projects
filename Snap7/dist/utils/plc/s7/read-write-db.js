"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDB = exports.readDB = void 0;
const get_date_as_string_1 = require("../../get-date-as-string");
const readDB = (s7client, db, start, len) => {
    return new Promise((resolve, reject) => {
        const data = s7client.DBRead(db, start, len);
        if (data instanceof Buffer) {
            resolve(data);
        }
        else {
            reject(`${(0, get_date_as_string_1.getDateAsString)()}Error while reading P#DB${db}.DBX${start}.0 BYTE ${len}`);
        }
    });
};
exports.readDB = readDB;
const writeDB = (s7client, db, start, len, buffer) => {
    return new Promise((resolve, reject) => {
        const writeOK = s7client.DBWrite(db, start, len, buffer);
        if (writeOK) {
            resolve();
        }
        else {
            reject(`${(0, get_date_as_string_1.getDateAsString)()}Error while writing P#DB${db}.DBX${start}.0 BYTE ${len}`);
        }
    });
};
exports.writeDB = writeDB;

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
const create_plc_connections_1 = require("./class/plc/s7/create-plc-connections");
const conn_params_1 = require("./connections/plc/s7/conn-params");
const conn_params_2 = require("./connections/plc/s7/conn-params");
const s7_plc = new create_plc_connections_1.S7_CreatePlcConnections(conn_params_1.s7_plcDefinitions, conn_params_1.s7_plcReadMultiVar, conn_params_1.s7_plcWriteMultiVar);
const s7_start = (id, dataToWrite) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        s7_plc.writeData(id, dataToWrite);
        const s7_readData = yield s7_plc.readData(id);
        s7_readData.forEach((res) => console.log(res.Data));
    }), conn_params_2.s7_triggetTime);
};
const data1 = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
const data2 = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];
s7_start(1, data1);
s7_start(2, data2);

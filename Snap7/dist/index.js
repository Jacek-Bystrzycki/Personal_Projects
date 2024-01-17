"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s7_plc = void 0;
const create_plc_connections_1 = require("./class/plc/s7/create-plc-connections");
const conn_params_1 = require("./connections/plc/s7/conn-params");
const temp_read_write_examples_1 = require("./utils/plc/s7/temp-read-write-examples");
//========== S7 read/write examples ===============
exports.s7_plc = new create_plc_connections_1.S7_CreatePlcConnections(conn_params_1.s7_plcDefinitions, conn_params_1.s7_plcReadMultiVar, conn_params_1.s7_plcWriteMultiVar);
const data1 = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
const data2 = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];
(0, temp_read_write_examples_1.s7_read)(1, [1, 2]);
(0, temp_read_write_examples_1.s7_read)(2, [1, 2]);
(0, temp_read_write_examples_1.s7_write)(1, [1, 2], data1);
(0, temp_read_write_examples_1.s7_write)(2, [1, 2], data2);

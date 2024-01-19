"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_devices = exports.s7_plc = void 0;
const create_plc_connections_1 = require("./class/plc/s7/create-plc-connections");
const conn_params_1 = require("./connections/plc/s7/conn-params");
const create_mb_connection_1 = require("./class/plc/mb/create-mb-connection");
const conn_params_2 = require("./connections/plc/mb/conn-params");
const custom_server_1 = require("./class/server/custom-server");
//========== S7-driver handling ===============
exports.s7_plc = new create_plc_connections_1.S7_CreateConnections(conn_params_1.s7_plcDefinitions, conn_params_1.s7_plcReadMultiVar, conn_params_1.s7_plcWriteMultiVar);
//========== Modbus TCP handling ===============
exports.mb_devices = new create_mb_connection_1.MB_CreateConnections(conn_params_2.mb_deviceDefinitions);
//========== Express REST server  ===============
const server = custom_server_1.CustomServer.server;

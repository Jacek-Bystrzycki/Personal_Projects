"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_devices_2 = exports.mb_devices_1 = exports.s7_plc_2 = exports.s7_plc_1 = void 0;
const create_plc_connections_1 = require("./class/plc/s7/create-plc-connections");
const conn_params_1 = require("./connections/plc/s7/conn-params");
const create_mb_connection_1 = require("./class/plc/mb/create-mb-connection");
const conn_params_2 = require("./connections/plc/mb/conn-params");
const custom_server_1 = require("./class/server/custom-server");
const conn_params_3 = require("./connections/server/conn-params");
//========== S7-driver handling ===============
exports.s7_plc_1 = new create_plc_connections_1.S7_CreateConnections(conn_params_1.s7plcDefinitions_1);
exports.s7_plc_2 = new create_plc_connections_1.S7_CreateConnections(conn_params_1.s7plcDefinitions_2);
//========== Modbus TCP handling ===============
exports.mb_devices_1 = new create_mb_connection_1.MB_CreateConnections(conn_params_2.mb_deviceDefinitions_1);
exports.mb_devices_2 = new create_mb_connection_1.MB_CreateConnections(conn_params_2.mb_deviceDefinitions_2);
//========== Express REST servers  ===============
const server1 = new custom_server_1.CustomServer(conn_params_3.port, { s7_definitions: exports.s7_plc_1, mb_definitions: exports.mb_devices_1 });
const server2 = new custom_server_1.CustomServer(conn_params_3.port + 1, { s7_definitions: exports.s7_plc_2, mb_definitions: exports.mb_devices_2 });

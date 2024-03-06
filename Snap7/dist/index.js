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
const create_mb_connection_1 = require("./class/plc/mb/create-mb-connection");
const create_rtu_connection_1 = require("./class/plc/rtu/create-rtu-connection");
const custom_server_1 = require("./class/server/custom-server");
const conn_params_1 = require("./connections/server/conn-params");
const s7_createTags_1 = require("./tags/s7_createTags");
const conn_params_2 = require("./connections/plc/s7/conn-params");
const mb_createTags_1 = require("./tags/mb_createTags");
const conn_params_3 = require("./connections/plc/mb/conn-params");
const conn_params_4 = require("./connections/plc/rtu/conn-params");
const conn_params_5 = require("./connections/plc/ua/conn-params");
const ua_createTags_1 = require("./tags/ua_createTags");
const create_ua_connection_1 = require("./class/plc/ua/create-ua-connection");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    //==================== Server 1 ==================
    //Prepare S7
    let s7Tags = yield (0, s7_createTags_1.createS7Tags)('s7-tags-s1-p1.xlsx');
    const plc1 = new conn_params_2.S7_Definition('10.0.0.10', 0, 1, s7Tags);
    s7Tags = yield (0, s7_createTags_1.createS7Tags)('s7-tags-s1-p2.xlsx');
    const plc2 = new conn_params_2.S7_Definition('10.0.0.15', 0, 1, s7Tags);
    const s7_plc_1 = new create_plc_connections_1.S7_CreateConnections([plc1.plc, plc2.plc]);
    //Prepare MB
    let mbTags = yield (0, mb_createTags_1.createMBTags)('mb-tags-s1-d1.xlsx');
    const device_1 = new conn_params_3.MB_Defintion({ host: '10.0.0.10', port: 502 }, 1, mbTags);
    let mbTags2 = yield (0, mb_createTags_1.createMBTags)('mb-tags-s1-d2.xlsx');
    const device_2 = new conn_params_3.MB_Defintion({ host: '10.0.0.15', port: 502 }, 2, mbTags);
    const mb_devices_1 = new create_mb_connection_1.MB_CreateConnections([device_1.device, device_2.device]);
    //Prepare RTU
    const rtuDef = [
        {
            uId: 1,
            tags: mbTags,
        },
        {
            uId: 2,
            tags: mbTags2,
        },
    ];
    const rtu_1 = new conn_params_4.RTU_Defintion('COM3', rtuDef);
    const rtu_devices_1 = new create_rtu_connection_1.RTU_CreateConnection(rtu_1.device);
    const server1 = new custom_server_1.CustomServer(conn_params_1.port, { s7_definitions: s7_plc_1, mb_definitions: mb_devices_1, rtu_definitions: rtu_devices_1 });
    //Prepare OPC UA
    const uaTags = yield (0, ua_createTags_1.createUATags)('ua-tags-s1-d1.xlsx');
    const ua1 = new conn_params_5.UA_Definition('opc.tcp://10.0.0.10:4840', uaTags);
    const ua_devices_1 = new create_ua_connection_1.UA_CreateConnections([ua1.device]);
    //==================== Server 2 ==================
    //Prepare RTU
    const rtu_2 = new conn_params_4.RTU_Defintion('COM5', rtuDef);
    const rtu_devices_2 = new create_rtu_connection_1.RTU_CreateConnection(rtu_2.device);
    const server2 = new custom_server_1.CustomServer(conn_params_1.port + 1, { rtu_definitions: rtu_devices_2 });
});
main();

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
// import { mb_deviceDefinitions_1, mb_deviceDefinitions_2 } from './connections/plc/mb/conn-params';
const conn_params_1 = require("./connections/plc/mb/conn-params");
const custom_server_1 = require("./class/server/custom-server");
const conn_params_2 = require("./connections/server/conn-params");
const importFile_1 = require("./tags/importFile");
const conn_params_3 = require("./connections/plc/s7/conn-params");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    //=== ================ Server 1 ==================
    let tagFile = 's7-tags-s1-p1.xlsx';
    let readTags = yield (0, importFile_1.createS7ReadTags)(tagFile);
    let writeTags = yield (0, importFile_1.createS7WriteTags)(tagFile);
    const plc1 = new conn_params_3.S7_Definition('10.0.0.15', 0, 1, readTags, writeTags);
    tagFile = 's7-tags-s1-p2.xlsx';
    readTags = yield (0, importFile_1.createS7ReadTags)(tagFile);
    writeTags = yield (0, importFile_1.createS7WriteTags)(tagFile);
    const plc2 = new conn_params_3.S7_Definition('10.0.0.10', 0, 1, readTags, writeTags);
    const mb_devices_1 = new create_mb_connection_1.MB_CreateConnections(conn_params_1.mb_deviceDefinitions_1);
    const s7_plc_1 = new create_plc_connections_1.S7_CreateConnections({ plcDefinitions: [plc1.plc, plc2.plc] });
    const server1 = new custom_server_1.CustomServer(conn_params_2.port, { s7_definitions: s7_plc_1, mb_definitions: mb_devices_1 });
    //=== ================ Server 2 ==================
    // tagFile = 's7-tags-s2-p2.xlsx';
    // readTags = await createS7ReadTags(tagFile);
    // writeTags = await createS7WriteTags(tagFile);
    // const plc3: S7_Definition = new S7_Definition('10.0.0.12', 0, 1, readTags, writeTags);
    // tagFile = 's7-tags-s2-p2.xlsx';
    // readTags = await createS7ReadTags(tagFile);
    // writeTags = await createS7WriteTags(tagFile);
    // const plc4: S7_Definition = new S7_Definition('10.0.0.17', 0, 1, readTags, writeTags);
    // const mb_devices_2 = new MB_CreateConnections(mb_deviceDefinitions_2);
    // const s7_plc_2 = new S7_CreateConnections({ plcDefinitions: [plc3.plc, plc4.plc] });
    // const server2 = new CustomServer(port + 1, { s7_definitions: s7_plc_2, mb_definitions: mb_devices_2 });
});
main();

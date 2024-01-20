import { S7_CreateConnections } from './class/plc/s7/create-plc-connections';
import { s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar } from './connections/plc/s7/conn-params';
import { MB_CreateConnections } from './class/plc/mb/create-mb-connection';
import { mb_deviceDefinitions } from './connections/plc/mb/conn-params';
import { CustomServer } from './class/server/custom-server';
import { port } from './connections/server/conn-params';

//========== S7-driver handling ===============
export const s7_plc_1 = new S7_CreateConnections(s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar);

//========== Modbus TCP handling ===============
export const mb_devices_1 = new MB_CreateConnections(mb_deviceDefinitions);

//========== Express REST servers  ===============
const serverForModbus = new CustomServer(port, { mb_definitions: mb_devices_1 });
const serverForS7 = new CustomServer(port + 1, { s7_definitions: s7_plc_1 });

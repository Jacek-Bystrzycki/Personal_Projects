import { S7_CreateConnections } from './class/plc/s7/create-plc-connections';
import { s7plcDefinitions_1, s7plcDefinitions_2 } from './connections/plc/s7/conn-params';
import { MB_CreateConnections } from './class/plc/mb/create-mb-connection';
import { mb_deviceDefinitions_1, mb_deviceDefinitions_2 } from './connections/plc/mb/conn-params';
import { CustomServer } from './class/server/custom-server';
import { port } from './connections/server/conn-params';

//========== S7-driver handling ===============
export const s7_plc_1 = new S7_CreateConnections(s7plcDefinitions_1);
export const s7_plc_2 = new S7_CreateConnections(s7plcDefinitions_2);

//========== Modbus TCP handling ===============
export const mb_devices_1 = new MB_CreateConnections(mb_deviceDefinitions_1);
export const mb_devices_2 = new MB_CreateConnections(mb_deviceDefinitions_2);

//========== Express REST servers  ===============
const server1 = new CustomServer(port, { s7_definitions: s7_plc_1, mb_definitions: mb_devices_1 });
const server2 = new CustomServer(port + 1, { s7_definitions: s7_plc_2, mb_definitions: mb_devices_2 });

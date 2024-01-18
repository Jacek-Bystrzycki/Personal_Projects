import { S7_CreatePlcConnections } from './class/plc/s7/create-plc-connections';
import { s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar } from './connections/plc/s7/conn-params';
import { s7_read, s7_write } from './utils/plc/s7/temp-read-write-examples';

//========== S7 read/write examples ===============
export const s7_plc = new S7_CreatePlcConnections(s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar);

const s7_data1: Buffer[] = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
const s7_data2: Buffer[] = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];

s7_read(1, [1, 2]);
s7_read(2, [1, 2]);
s7_write(1, [1, 2], s7_data1);
s7_write(2, [1, 2], s7_data2);

//========== Modbus TCP read/write examples ===============
import { MB_CreateConnections } from './class/plc/mb/create-mb-connection';
import { mb_deviceDefinitions } from './connections/plc/mb/conn-params';
import { mb_read, mb_write } from './utils/plc/mb/temp-read-write-examples';

export const mb_devices = new MB_CreateConnections(mb_deviceDefinitions);

const mb_data1: number[] = [111, 222];
const mb_data2: number[] = [555, 666, 777, 888];

mb_read(1, [0, 2]);
mb_read(2, [10, 4]);
mb_write(1, 0, mb_data1);
mb_write(2, 10, mb_data2);

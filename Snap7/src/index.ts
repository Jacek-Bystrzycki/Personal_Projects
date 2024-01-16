import { S7_CreatePlcConnections } from './class/plc/s7/create-plc-connections';
import { s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar } from './connections/plc/s7/conn-params';
import { s7_triggetTime } from './connections/plc/s7/conn-params';

const s7_plc = new S7_CreatePlcConnections(s7_plcDefinitions, s7_plcReadMultiVar, s7_plcWriteMultiVar);

const s7_start = (id: number, dataToWrite: Buffer[]) => {
  setInterval(async () => {
    s7_plc.writeData(id, dataToWrite);
    const s7_readData = await s7_plc.readData(id);
    s7_readData.forEach((res) => console.log(res.Data));
  }, s7_triggetTime);
};

const data1: Buffer[] = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
const data2: Buffer[] = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];
s7_start(1, data1);
s7_start(2, data2);

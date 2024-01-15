import { CreatePlcConnections } from './class/plc/s7/create-plc-connections';
import plcDefinitions from './connections/plc/s7/conn-params';

const plc = new CreatePlcConnections(plcDefinitions);
const newData1: Buffer = Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]);
const newData2: Buffer = Buffer.from([0xff, 0xc9, 0x00, 0xaf, 0xc7, 0x2e]);

const start = (id: number, data: Buffer) => {
  plc.connectToPlc(id);
  setInterval(async () => {
    plc.setWriteBuffer(id, data);
    plc.writeData(id, 1, 0, data.byteLength);
    const readData = await plc.readData(id, 1, 0, data.byteLength);
    if (readData instanceof Buffer) console.log(readData);
  }, 3000);
};

start(1, newData1);
start(2, newData2);

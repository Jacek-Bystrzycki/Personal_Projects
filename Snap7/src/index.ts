import { S7_CreateConnections } from './class/plc/s7/create-plc-connections';
import { MB_CreateConnections } from './class/plc/mb/create-mb-connection';
import { RTU_CreateConnection } from './class/plc/rtu/create-mb-connection';
import { CustomServer } from './class/server/custom-server';
import { port } from './connections/server/conn-params';
import type { S7_Tags } from './types/plc/s7/format';
import { createS7Tags } from './tags/s7_createTags';
import { S7_Definition } from './connections/plc/s7/conn-params';
import { createMBTags } from './tags/mb_createTags';
import { MB_Defintion } from './connections/plc/mb/conn-params';
import { MB_TagDef } from './types/plc/mb/format';
import { RTU_Defintion } from './connections/plc/rtu/conn-params';
import { RTUConDef } from './types/plc/rtu/definitions';

const main = async (): Promise<void> => {
  //=== ================ Server 1 ==================
  let s7Tags: S7_Tags = await createS7Tags('s7-tags-s1-p1.xlsx');
  const plc1: S7_Definition = new S7_Definition('10.0.0.10', 0, 1, s7Tags);
  s7Tags = await createS7Tags('s7-tags-s1-p2.xlsx');
  const plc2: S7_Definition = new S7_Definition('10.0.0.15', 0, 1, s7Tags);
  const s7_plc_1 = new S7_CreateConnections([plc1.plc, plc2.plc]);

  let mbTags: MB_TagDef[] = await createMBTags('mb-tags-s1-d1.xlsx');
  const device_1: MB_Defintion = new MB_Defintion({ host: '10.0.0.10', port: 502 }, 1, mbTags);

  let mbTags2 = await createMBTags('mb-tags-s1-d2.xlsx');
  const device_2: MB_Defintion = new MB_Defintion({ host: '10.0.0.15', port: 502 }, 2, mbTags);

  const mb_devices_1 = new MB_CreateConnections([device_1.device, device_2.device]);

  const rtuDef: RTUConDef[] = [
    {
      uId: 1,
      tags: mbTags,
    },
    {
      uId: 2,
      tags: mbTags2,
    },
  ];
  const rtu_1: RTU_Defintion = new RTU_Defintion('COM3', rtuDef);
  const rtu_devices = new RTU_CreateConnection(rtu_1.device);

  const server1 = new CustomServer(port, { s7_definitions: s7_plc_1, mb_definitions: mb_devices_1, rtu_definitions: rtu_devices });

  //=========
  // const rtu_2: RTU_Defintion = new RTU_Defintion('COM5', rtuDef);
  // const rtu_devices2 = new RTU_CreateConnection(rtu_1.device);
  // const server2 = new CustomServer(port + 1, { rtu_definitions: rtu_devices2 });
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
};

main();

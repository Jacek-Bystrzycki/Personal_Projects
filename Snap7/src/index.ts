import { S7_CreateConnections } from './class/plc/s7/create-plc-connections';
import { MB_CreateConnections } from './class/plc/mb/create-mb-connection';
// import { mb_deviceDefinitions_1, mb_deviceDefinitions_2 } from './connections/plc/mb/conn-params';
import { mb_deviceDefinitions_1 } from './connections/plc/mb/conn-params';
import { CustomServer } from './class/server/custom-server';
import { port } from './connections/server/conn-params';
import type { S7_Tags } from './types/plc/s7/format';
import { createS7Tags } from './tags/importFile';
import { S7_Definition } from './connections/plc/s7/conn-params';

const main = async (): Promise<void> => {
  //=== ================ Server 1 ==================
  let tagFile: string = 's7-tags-s1-p1.xlsx';
  let tags: S7_Tags = await createS7Tags(tagFile);
  const plc1: S7_Definition = new S7_Definition('10.0.0.15', 0, 1, tags);

  tagFile = 's7-tags-s1-p2.xlsx';
  tags = await createS7Tags(tagFile);
  const plc2: S7_Definition = new S7_Definition('10.0.0.10', 0, 1, tags);

  const mb_devices_1 = new MB_CreateConnections(mb_deviceDefinitions_1);
  const s7_plc_1 = new S7_CreateConnections({ plcDefinitions: [plc2.plc] });
  const server1 = new CustomServer(port, { s7_definitions: s7_plc_1, mb_definitions: mb_devices_1 });
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

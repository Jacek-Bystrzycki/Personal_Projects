import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import { MB_ReadParams, MB_WriteParams } from '../../../types/plc/mb/buffers';

//===========DEFINITIONS FOR SERVER 1: ==================
//== Device 1 ===========================
const query1Read: MB_ReadParams[] = [
  { start: 0, count: 3 },
  { start: 2, count: 2 },
];
const query1Write: MB_WriteParams[] = [
  { start: 0, data: [0x00, 0x00] },
  { start: 2, data: [0x00, 0x00] },
];

const device1_1: MB_ConnectionParamType = [{ host: '10.0.0.10', port: 502 }, query1Read, query1Write];
//== Device 2 ===========================
// const device1_2: MB_ConnectionParamType = [{ host: '172.16.0.11', port: 502 }];

// export const mb_deviceDefinitions_1: MB_ConnectionParamType[] = [device1_1, device1_2];
export const mb_deviceDefinitions_1: MB_ConnectionParamType[] = [device1_1];

// //===========DEFINITIONS FOR SERVER 2: ==================
// //== Device 1 ===========================
// const device2_1: MB_ConnectionParamType = [{ host: '172.16.0.12', port: 502 }];
// //== Device 2 ===========================
// const device2_2: MB_ConnectionParamType = [{ host: '172.16.0.13', port: 502 }];

// export const mb_deviceDefinitions_2: MB_ConnectionParamType[] = [device2_1, device2_2];

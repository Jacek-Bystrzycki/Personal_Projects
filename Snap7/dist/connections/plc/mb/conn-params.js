"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_deviceDefinitions_1 = void 0;
//===========DEFINITIONS FOR SERVER 1: ==================
//== Device 1 ===========================
const query1Read = [
    { start: 0, count: 3 },
    { start: 10, count: 2 },
];
const query1Write = [
    { start: 0, data: [0x00, 0x00] },
    { start: 2, data: [0x00, 0x00] },
];
const device1_1 = [{ host: '10.0.0.10', port: 502 }, query1Read, query1Write];
//== Device 2 ===========================
// const device1_2: MB_ConnectionParamType = [{ host: '172.16.0.11', port: 502 }];
// export const mb_deviceDefinitions_1: MB_ConnectionParamType[] = [device1_1, device1_2];
exports.mb_deviceDefinitions_1 = [device1_1];
// //===========DEFINITIONS FOR SERVER 2: ==================
// //== Device 1 ===========================
// const device2_1: MB_ConnectionParamType = [{ host: '172.16.0.12', port: 502 }];
// //== Device 2 ===========================
// const device2_2: MB_ConnectionParamType = [{ host: '172.16.0.13', port: 502 }];
// export const mb_deviceDefinitions_2: MB_ConnectionParamType[] = [device2_1, device2_2];

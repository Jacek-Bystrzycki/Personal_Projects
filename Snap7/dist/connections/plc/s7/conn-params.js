"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s7plcDefinitions_2 = exports.s7plcDefinitions_1 = exports.s7_triggetTime = void 0;
exports.s7_triggetTime = 3137;
//===========DEFINITIONS FOR SERVER 1: ==================
//== PLC 1 =====================
const plc1_1 = ['172.16.0.10', 0, 1];
const plc1_1_ReadMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 4,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 4,
    },
];
const plc1_1_WriteMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 4,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 4,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
    },
];
//== PLC 2 =====================
const plc1_2 = ['172.16.0.11', 0, 1];
const plc1_2_ReadMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 8,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
    },
];
const plc1_2_WriteMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 8,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    },
];
const s7_plcDefinitions_1 = [plc1_1, plc1_2];
const s7_plcReadMultiVar_1 = [plc1_1_ReadMultiVar, plc1_2_ReadMultiVar];
const s7_plcWriteMultiVar_1 = [plc1_1_WriteMultiVar, plc1_2_WriteMultiVar];
exports.s7plcDefinitions_1 = {
    plcDefinitions: s7_plcDefinitions_1,
    multiVarRead: s7_plcReadMultiVar_1,
    multiVarWrite: s7_plcWriteMultiVar_1,
};
//===========DEFINITIONS FOR SERVER 2: ==================
//== PLC 1 =====================
const plc2_1 = ['172.16.0.12', 0, 1];
const plc2_1_ReadMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 4,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 4,
    },
];
const plc2_1_WriteMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 4,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 4,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
    },
];
//== PLC 2 =====================
const plc2_2 = ['172.16.0.13', 0, 1];
const plc2_2_ReadMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 8,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
    },
];
const plc2_2_WriteMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 1,
        Start: 0,
        Amount: 8,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
        Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    },
];
const s7_plcDefinitions_2 = [plc2_1, plc2_2];
const s7_plcReadMultiVar_2 = [plc2_1_ReadMultiVar, plc2_2_ReadMultiVar];
const s7_plcWriteMultiVar_2 = [plc2_1_WriteMultiVar, plc2_2_WriteMultiVar];
exports.s7plcDefinitions_2 = {
    plcDefinitions: s7_plcDefinitions_2,
    multiVarRead: s7_plcReadMultiVar_2,
    multiVarWrite: s7_plcWriteMultiVar_2,
};

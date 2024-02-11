"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s7plcDefinitions_2 = exports.s7plcDefinitions_1 = exports.s7_triggetTime = void 0;
exports.s7_triggetTime = 1000;
//===========DEFINITIONS FOR SERVER 1: ==================
//== PLC 1 =====================
const plc1_1_ReadMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 8 /* snap7.WordLen.S7WLReal */,
        DBNumber: 102,
        Start: 212,
        Amount: 2,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 4 /* snap7.WordLen.S7WLWord */,
        DBNumber: 102,
        Start: 6,
        Amount: 2,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 6 /* snap7.WordLen.S7WLDWord */,
        DBNumber: 102,
        Start: 2,
        Amount: 1,
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 102,
        Start: 314,
        Amount: 1,
    },
];
const plc1_1_WriteMultiVar = [
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 8 /* snap7.WordLen.S7WLReal */,
        DBNumber: 102,
        Start: 244,
        Amount: 2,
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 6 /* snap7.WordLen.S7WLDWord */,
        DBNumber: 102,
        Start: 306,
        Amount: 1,
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 4 /* snap7.WordLen.S7WLWord */,
        DBNumber: 102,
        Start: 310,
        Amount: 1,
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 102,
        Start: 314,
        Amount: 4,
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 1 /* snap7.WordLen.S7WLBit */,
        DBNumber: 102,
        Start: 314 * 8 + 5,
        Amount: 1,
        Data: Buffer.from([0]),
    },
];
const plc1_1 = ['10.0.0.10', 0, 1, plc1_1_ReadMultiVar, plc1_1_WriteMultiVar];
//== PLC 2 =====================
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
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
        Data: Buffer.from([0]),
    },
];
const plc1_2 = ['172.16.0.11', 0, 1, plc1_2_ReadMultiVar, plc1_2_WriteMultiVar];
const s7_plcDefinitions_1 = [plc1_1, plc1_2];
exports.s7plcDefinitions_1 = {
    plcDefinitions: s7_plcDefinitions_1,
};
//===========DEFINITIONS FOR SERVER 2: ==================
//== PLC 1 =====================
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
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 4,
        Data: Buffer.from([0]),
    },
];
const plc2_1 = ['172.16.0.12', 0, 1, plc2_1_ReadMultiVar, plc2_1_WriteMultiVar];
//== PLC 2 =====================
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
        Data: Buffer.from([0]),
    },
    {
        Area: 132 /* snap7.Area.S7AreaDB */,
        WordLen: 2 /* snap7.WordLen.S7WLByte */,
        DBNumber: 2,
        Start: 0,
        Amount: 6,
        Data: Buffer.from([0]),
    },
];
const plc2_2 = ['172.16.0.13', 0, 1, plc2_2_ReadMultiVar, plc2_2_WriteMultiVar];
const s7_plcDefinitions_2 = [plc2_1, plc2_2];
exports.s7plcDefinitions_2 = {
    plcDefinitions: s7_plcDefinitions_2,
};

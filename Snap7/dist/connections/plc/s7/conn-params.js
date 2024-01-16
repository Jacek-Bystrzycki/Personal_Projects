"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s7_plcWriteMultiVar = exports.s7_plcReadMultiVar = exports.s7_plcDefinitions = exports.s7_triggetTime = void 0;
const snap7 = require("node-snap7");
exports.s7_triggetTime = 3000;
//== PLC 1 =====================
const plc1 = ['172.16.0.10', 0, 1, new snap7.S7Client()];
const plc1ReadMultiVar = [
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
const plc1WriteMultiVar = [
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
const plc2 = ['172.16.0.11', 0, 1, new snap7.S7Client()];
const plc2ReadMultiVar = [
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
const plc2WriteMultiVar = [
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
exports.s7_plcDefinitions = [plc1, plc2];
exports.s7_plcReadMultiVar = [plc1ReadMultiVar, plc2ReadMultiVar];
exports.s7_plcWriteMultiVar = [plc1WriteMultiVar, plc2WriteMultiVar];

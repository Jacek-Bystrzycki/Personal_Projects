import snap7 = require('node-snap7');
import { S7_ConnectionParamType, S7_CreateConnectionsParams } from '../../../types/plc/s7/conn-param';

export const s7_triggetTime: number = 3137;

//===========DEFINITIONS FOR SERVER 1: ==================
//== PLC 1 =====================
const plc1_1: S7_ConnectionParamType = ['10.0.0.10', 0, 1];
const plc1_1_ReadMultiVar: snap7.MultiVarRead[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLReal,
    DBNumber: 102,
    Start: 212,
    Amount: 2,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLWord,
    DBNumber: 102,
    Start: 6,
    Amount: 2,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLDWord,
    DBNumber: 102,
    Start: 2,
    Amount: 1,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 102,
    Start: 256,
    Amount: 1,
  },
];
const plc1_1_WriteMultiVar: snap7.MultiVarWrite[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 102,
    Start: 256,
    Amount: 4,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 102,
    Start: 270,
    Amount: 4,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
  },
];

//== PLC 2 =====================
const plc1_2: S7_ConnectionParamType = ['172.16.0.11', 0, 1];
const plc1_2_ReadMultiVar: snap7.MultiVarRead[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 8,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 6,
  },
];
const plc1_2_WriteMultiVar: snap7.MultiVarWrite[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 8,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 6,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  },
];

const s7_plcDefinitions_1: S7_ConnectionParamType[] = [plc1_1, plc1_2];
const s7_plcReadMultiVar_1: snap7.MultiVarRead[][] = [plc1_1_ReadMultiVar, plc1_2_ReadMultiVar];
const s7_plcWriteMultiVar_1: snap7.MultiVarWrite[][] = [plc1_1_WriteMultiVar, plc1_2_WriteMultiVar];

export const s7plcDefinitions_1: S7_CreateConnectionsParams = {
  plcDefinitions: s7_plcDefinitions_1,
  multiVarRead: s7_plcReadMultiVar_1,
  multiVarWrite: s7_plcWriteMultiVar_1,
};

//===========DEFINITIONS FOR SERVER 2: ==================
//== PLC 1 =====================
const plc2_1: S7_ConnectionParamType = ['172.16.0.12', 0, 1];
const plc2_1_ReadMultiVar: snap7.MultiVarRead[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 4,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 4,
  },
];
const plc2_1_WriteMultiVar: snap7.MultiVarWrite[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 4,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 4,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00]),
  },
];

//== PLC 2 =====================
const plc2_2: S7_ConnectionParamType = ['172.16.0.13', 0, 1];
const plc2_2_ReadMultiVar: snap7.MultiVarRead[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 8,
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 6,
  },
];
const plc2_2_WriteMultiVar: snap7.MultiVarWrite[] = [
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 1,
    Start: 0,
    Amount: 8,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  },
  {
    Area: snap7.Area.S7AreaDB,
    WordLen: snap7.WordLen.S7WLByte,
    DBNumber: 2,
    Start: 0,
    Amount: 6,
    Data: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  },
];

const s7_plcDefinitions_2: S7_ConnectionParamType[] = [plc2_1, plc2_2];
const s7_plcReadMultiVar_2: snap7.MultiVarRead[][] = [plc2_1_ReadMultiVar, plc2_2_ReadMultiVar];
const s7_plcWriteMultiVar_2: snap7.MultiVarWrite[][] = [plc2_1_WriteMultiVar, plc2_2_WriteMultiVar];

export const s7plcDefinitions_2: S7_CreateConnectionsParams = {
  plcDefinitions: s7_plcDefinitions_2,
  multiVarRead: s7_plcReadMultiVar_2,
  multiVarWrite: s7_plcWriteMultiVar_2,
};

import snap7 = require('node-snap7');
import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';

export const s7_triggetTime: number = 3000;

//== PLC 1 =====================
const plc1: S7_ConnectionParamType = ['172.16.0.10', 0, 1, new snap7.S7Client()];
const plc1ReadMultiVar: snap7.MultiVarRead[] = [
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
const plc1WriteMultiVar: snap7.MultiVarWrite[] = [
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
const plc2: S7_ConnectionParamType = ['172.16.0.11', 0, 1, new snap7.S7Client()];
const plc2ReadMultiVar: snap7.MultiVarRead[] = [
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
const plc2WriteMultiVar: snap7.MultiVarWrite[] = [
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

export const s7_plcDefinitions: S7_ConnectionParamType[] = [plc1, plc2];
export const s7_plcReadMultiVar: snap7.MultiVarRead[][] = [plc1ReadMultiVar, plc2ReadMultiVar];
export const s7_plcWriteMultiVar: snap7.MultiVarWrite[][] = [plc1WriteMultiVar, plc2WriteMultiVar];

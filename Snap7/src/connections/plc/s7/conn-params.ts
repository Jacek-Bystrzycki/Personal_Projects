import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';
import type { S7_ReadTagDef, S7_WriteTagDef } from '../../../types/plc/s7/format';

export const s7_triggetTime: number = 1000;
//=======================================================
export class S7_Definition {
  private _plc: S7_ConnectionParamType;
  constructor(
    private readonly ip: string,
    private readonly rack: number,
    private readonly slot: number,
    private readonly readTags: S7_ReadTagDef[],
    private readonly writeTags: S7_WriteTagDef[]
  ) {
    this._plc = [this.ip, this.rack, this.slot, this.readTags, this.writeTags];
  }

  public get plc(): S7_ConnectionParamType {
    return this._plc;
  }
}
//===========DEFINITIONS FOR SERVER 1: ==================
//== PLC 1 =====================
// const plc1_1_ReadMultiVar: snap7.MultiVarRead[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLReal,
//     DBNumber: 102,
//     Start: 212,
//     Amount: 2,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLWord,
//     DBNumber: 102,
//     Start: 6,
//     Amount: 2,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLDWord,
//     DBNumber: 102,
//     Start: 2,
//     Amount: 1,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 102,
//     Start: 314,
//     Amount: 1,
//   },
// ];
// const plc1_1_WriteMultiVar: snap7.MultiVarWrite[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLReal,
//     DBNumber: 102,
//     Start: 244,
//     Amount: 2,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLDWord,
//     DBNumber: 102,
//     Start: 306,
//     Amount: 1,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLWord,
//     DBNumber: 102,
//     Start: 310,
//     Amount: 1,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 102,
//     Start: 314,
//     Amount: 4,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLBit,
//     DBNumber: 102,
//     Start: 314 * 8 + 5,
//     Amount: 1,
//     Data: Buffer.from([0]),
//   },
// ];

// const plc1_1: S7_ConnectionParamType = ['10.0.0.10', 0, 1, plc1_1_ReadMultiVar, plc1_1_WriteMultiVar];

// //== PLC 2 =====================
// const plc1_2_ReadMultiVar: snap7.MultiVarRead[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 8,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 6,
//   },
// ];
// const plc1_2_WriteMultiVar: snap7.MultiVarWrite[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 8,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 6,
//     Data: Buffer.from([0]),
//   },
// ];

// const plc1_2: S7_ConnectionParamType = ['172.16.0.11', 0, 1, plc1_2_ReadMultiVar, plc1_2_WriteMultiVar];
// const s7_plcDefinitions_1: S7_ConnectionParamType[] = [plc1_1, plc1_2];

// export const s7plcDefinitions_1: S7_CreateConnectionsParams = {
//   plcDefinitions: s7_plcDefinitions_1,
// };

// //===========DEFINITIONS FOR SERVER 2: ==================
// //== PLC 1 =====================
// const plc2_1_ReadMultiVar: snap7.MultiVarRead[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 4,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 4,
//   },
// ];
// const plc2_1_WriteMultiVar: snap7.MultiVarWrite[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 4,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 4,
//     Data: Buffer.from([0]),
//   },
// ];

// const plc2_1: S7_ConnectionParamType = ['172.16.0.12', 0, 1, plc2_1_ReadMultiVar, plc2_1_WriteMultiVar];
// //== PLC 2 =====================
// const plc2_2_ReadMultiVar: snap7.MultiVarRead[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 8,
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 6,
//   },
// ];
// const plc2_2_WriteMultiVar: snap7.MultiVarWrite[] = [
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 1,
//     Start: 0,
//     Amount: 8,
//     Data: Buffer.from([0]),
//   },
//   {
//     Area: snap7.Area.S7AreaDB,
//     WordLen: snap7.WordLen.S7WLByte,
//     DBNumber: 2,
//     Start: 0,
//     Amount: 6,
//     Data: Buffer.from([0]),
//   },
// ];

// const plc2_2: S7_ConnectionParamType = ['172.16.0.13', 0, 1, plc2_2_ReadMultiVar, plc2_2_WriteMultiVar];
// const s7_plcDefinitions_2: S7_ConnectionParamType[] = [plc2_1, plc2_2];

// export const s7plcDefinitions_2: S7_CreateConnectionsParams = {
//   plcDefinitions: s7_plcDefinitions_2,
// };

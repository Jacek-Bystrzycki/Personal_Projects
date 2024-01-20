import { S7_ConnectToPlc } from '../../../class/plc/s7/connect-to-plc';
import snap7 = require('node-snap7');

export type S7_ConnectionParamType = ConstructorParameters<typeof S7_ConnectToPlc>;
export type S7_CreateConnectionsParams = {
  plcDefinitions: S7_ConnectionParamType[];
  multiVarRead: snap7.MultiVarRead[][];
  multiVarWrite: snap7.MultiVarWrite[][];
};

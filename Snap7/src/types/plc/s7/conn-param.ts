import { S7_ConnectToPlc } from '../../../class/plc/s7/connect-to-plc';

export type S7_ConnectionParamType = ConstructorParameters<typeof S7_ConnectToPlc>;
export type S7_CreateConnectionsParams = {
  plcDefinitions: S7_ConnectionParamType[];
};

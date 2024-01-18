import { MB_ConnectToDevice } from '../../../class/plc/mb/connect-to-devide';

export type MB_Registers = [readStart: number, readCount: number];

export type MB_ConnectionParamType = ConstructorParameters<typeof MB_ConnectToDevice>;

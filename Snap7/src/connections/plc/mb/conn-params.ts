import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';

//== Device 1 ===========================
const device1: MB_ConnectionParamType = [{ host: '172.16.0.10', port: 502 }];
//== Device 2 ===========================
const device2: MB_ConnectionParamType = [{ host: '172.16.0.11', port: 502 }];

export const mb_deviceDefinitions: MB_ConnectionParamType[] = [device1, device2];

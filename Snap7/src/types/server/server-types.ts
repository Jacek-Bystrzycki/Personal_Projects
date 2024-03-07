import { Express } from 'express';
import { S7_CreateConnections } from '../../class/plc/s7/create-plc-connections';
import { MB_CreateConnections } from '../../class/plc/mb/create-mb-connection';
import { RTU_CreateConnection } from '../../class/plc/rtu/create-rtu-connection';
import { UA_CreateConnections } from '../../class/plc/ua/create-ua-connection';

export type ServerDevices = {
  s7_definitions?: S7_CreateConnections;
  mb_definitions?: MB_CreateConnections;
  rtu_definitions?: RTU_CreateConnection;
  ua_definitions?: UA_CreateConnections;
};

export interface ServerType {
  readonly app: Express;
  readonly devices: ServerDevices;
}

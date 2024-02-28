import { Express } from 'express';
import { S7_CreateConnections } from '../../class/plc/s7/create-plc-connections';
import { MB_CreateConnections } from '../../class/plc/mb/create-mb-connection';
import { RTU_CreateConnection } from '../../class/plc/rtu/create-mb-connection';

export type ServerDevices = {
  s7_definitions?: S7_CreateConnections;
  mb_definitions?: MB_CreateConnections;
  rtu_definitions?: RTU_CreateConnection;
};

export interface ServerType {
  readonly app: Express;
  readonly devices: ServerDevices;
}

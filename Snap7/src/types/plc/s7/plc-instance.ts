import { ConnectToPlc } from '../../../class/plc/s7/connect-to-plc';

export type PLCInstance = {
  id: number;
  instance: ConnectToPlc;
};

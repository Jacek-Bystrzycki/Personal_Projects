import snap7 = require('node-snap7');
import { ConnectionParamType } from '../../../types/plc/s7/conn-param';

const plc1: ConnectionParamType = ['172.16.0.10', 0, 1, 3000, new snap7.S7Client()];
const plc2: ConnectionParamType = ['172.16.0.11', 0, 1, 3000, new snap7.S7Client()];

const plcDefinitions: ConnectionParamType[] = [plc1, plc2];
export default plcDefinitions;

import snap7 = require('node-snap7');
import { readAreas, writeAreas } from '../../../utils/plc/s7/read-write-db';

export class S7_DataPLC {
  constructor(protected readonly s7client: snap7.S7Client) {}

  public readFromPlc = async (multiVar: snap7.MultiVarRead[]): Promise<snap7.MultiVarsReadResult[]> => {
    return readAreas(this.s7client, multiVar);
  };
  public writeToPlc = async (multiVar: snap7.MultiVarWrite[]): Promise<void> => {
    return writeAreas(this.s7client, multiVar);
  };
}

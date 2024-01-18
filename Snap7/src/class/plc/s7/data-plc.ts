import snap7 = require('node-snap7');
import { s7_readAreas, s7_writeAreas } from '../../../utils/plc/s7/read-write-db';

export class S7_DataPLC {
  protected s7client: snap7.S7Client;
  constructor() {
    this.s7client = new snap7.S7Client();
  }
  public s7_readFromPlc = async (multiVar: snap7.MultiVarRead[]): Promise<snap7.MultiVarsReadResult[]> => {
    return s7_readAreas(this.s7client, multiVar);
  };
  public s7_writeToPlc = async (multiVar: snap7.MultiVarWrite[]): Promise<void> => {
    return s7_writeAreas(this.s7client, multiVar);
  };
}

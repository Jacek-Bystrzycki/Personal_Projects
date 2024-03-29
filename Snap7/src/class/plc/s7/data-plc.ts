import snap7 = require('node-snap7');
import { InternalError } from '../../../types/server/errors';
import { getObjectValue } from '../../../utils/get-object-prop';

export class S7_DataPLC {
  protected s7client: snap7.S7Client;
  constructor() {
    this.s7client = new snap7.S7Client();
  }
  public s7_readFromPlc = async (multiVar: snap7.MultiVarRead[]): Promise<snap7.MultiVarsReadResult[]> => {
    return new Promise<snap7.MultiVarsReadResult[]>((resolve, reject) => {
      this.s7client.ReadMultiVars(multiVar, (err, data) => {
        if (!err && data.every((result) => result.Result === 0)) resolve(data);
        const errorDataDBValues = JSON.stringify(getObjectValue(multiVar, 'DBNumber'));
        reject(new InternalError(`Cannot read-write data from-to DBs:${errorDataDBValues}`));
      });
    });
  };
  public s7_writeToPlc = async (multiVar: snap7.MultiVarWrite[]): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this.s7client.WriteMultiVars(multiVar, (err, data) => {
        if (!err && data.every((result) => result.Result === 0)) resolve();
        const errorDataDBValues = JSON.stringify(getObjectValue(multiVar, 'DBNumber'));
        reject(new InternalError(`Cannot write data to DBs:${errorDataDBValues}`));
      });
    });
  };
}

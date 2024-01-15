import snap7 = require('node-snap7');
import { readDB, writeDB } from '../../../utils/plc/s7/read-write-db';

export class DataPLC {
  constructor(protected readonly s7client: snap7.S7Client) {}

  public readFromPlc = async (db: number, start: number, len: number): Promise<Buffer | void> => {
    try {
      return await readDB(this.s7client, db, start, len);
    } catch (error) {
      console.log(error);
    }
  };

  public writeToPlc = async (db: number, start: number, len: number, buffer: Buffer): Promise<void> => {
    try {
      await writeDB(this.s7client, db, start, len, buffer);
    } catch (error) {
      console.log(error);
    }
  };
}

import snap7 = require('node-snap7');
import { getDateAsString } from '../../get-date-as-string';

export const readDB = (s7client: snap7.S7Client, db: number, start: number, len: number) => {
  return new Promise<Buffer>((resolve, reject) => {
    const data: boolean | Buffer = s7client.DBRead(db, start, len);
    if (data instanceof Buffer) {
      resolve(data);
    } else {
      reject(`${getDateAsString()}Error while reading P#DB${db}.DBX${start}.0 BYTE ${len}`);
    }
  });
};

export const writeDB = (s7client: snap7.S7Client, db: number, start: number, len: number, buffer: Buffer) => {
  return new Promise<void>((resolve, reject) => {
    const writeOK: boolean = s7client.DBWrite(db, start, len, buffer);
    if (writeOK) {
      resolve();
    } else {
      reject(`${getDateAsString()}Error while writing P#DB${db}.DBX${start}.0 BYTE ${len}`);
    }
  });
};

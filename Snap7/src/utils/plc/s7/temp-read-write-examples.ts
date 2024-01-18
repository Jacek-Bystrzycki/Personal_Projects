import { s7_plc } from '../../..';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { getDateAsString } from '../../get-date-as-string';

//In standard application use s7_plc.readData() and s7_plc.writeData() in express controllers instead to trigger it in setInterval!!!
export const s7_read = (id: number, indexes: number[]): void => {
  setInterval(async () => {
    try {
      const s7_readData = await s7_plc.s7_readData(id, indexes);
      s7_readData.forEach((res, index) => {
        const data = [...res.Data];
        console.log(`${getDateAsString()}S7-Read - id ${id}, index ${indexes[index]}: [${data}]`);
      });
    } catch (error) {
      console.log(`${getDateAsString()}S7-Read - Cannot read from PLC id: ${id}: ${error}`);
    }
  }, s7_triggetTime);
};
export const s7_write = (id: number, indexes: number[], dataToWrite: Buffer[]): void => {
  setInterval(async () => {
    try {
      await s7_plc.s7_writeData(id, indexes, dataToWrite);
    } catch (error) {
      console.log(`${getDateAsString()}S7-Write - Cannot write to PLC id: ${id}: ${error}`);
    }
  }, s7_triggetTime * 4.72);
};

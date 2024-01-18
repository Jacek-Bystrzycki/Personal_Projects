import { mb_devices } from '../../..';
import { MB_Registers } from '../../../types/plc/mb/conn-params';
import { getDateAsString } from '../../get-date-as-string';

//In standard application use mb_ReadFromDevice() and mb_WriteToDevice() in express controllers instead to trigger it in setInterval!!!
export const mb_read = (id: number, regs: MB_Registers): void => {
  setInterval(async () => {
    try {
      const data = await mb_devices.mb_ReadFromDevice(id, regs);
      console.log(`${getDateAsString()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: [${data}]`);
    } catch (error) {
      console.log(`${getDateAsString()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: ${error}`);
    }
  }, 2317);
};

export const mb_write = (id: number, start: number, data: number[]): void => {
  setInterval(async () => {
    try {
      await mb_devices.mb_WriteToDevice(id, start, data);
    } catch (error) {
      console.log(`${getDateAsString()}MB-Write - id ${id}, registers ${start}-${start + data.length}: ${error}`);
    }
  }, 4723);
};

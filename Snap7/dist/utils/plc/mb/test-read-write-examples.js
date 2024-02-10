"use strict";
// import { mb_devices_1 } from '../../..';
// import { MB_Registers } from '../../../types/plc/mb/conn-params';
// import { getDateAsString } from '../../get-date-as-string';
// //In standard application use mb_ReadFromDevice() and mb_WriteToDevice() in express controllers instead to trigger it in setInterval!!!
// const mb_read = (id: number, regs: MB_Registers): void => {
//   setInterval(async () => {
//     try {
//       const data = await mb_devices_1.mb_ReadFromDevice(id, regs);
//       console.log(`${getDateAsString()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: [${data}]`);
//     } catch (error) {
//       console.log(`${getDateAsString()}MB-Read - id ${id}, registers ${regs[0]}-${regs[0] + regs[1]}: ${error}`);
//     }
//   }, 2317);
// };
// const mb_write = (id: number, start: number, data: number[]): void => {
//   setInterval(async () => {
//     try {
//       await mb_devices_1.mb_WriteToDevice(id, start, data);
//     } catch (error) {
//       console.log(`${getDateAsString()}MB-Write - id ${id}, registers ${start}-${start + data.length}: ${error}`);
//     }
//   }, 4723);
// };
// const mb_data1: number[] = [111, 222];
// const mb_data2: number[] = [555, 666, 777, 888];
// mb_read(1, [0, 2]);
// mb_read(2, [10, 4]);
// mb_write(1, 0, mb_data1);
// mb_write(2, 10, mb_data2);

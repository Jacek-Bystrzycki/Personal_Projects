"use strict";
// import { s7_plc_1 } from '../../..';
// import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
// import { getDateAsString } from '../../get-date-as-string';
// //In standard application use s7_plc.readData() and s7_plc.writeData() in express controllers instead to trigger it in setInterval!!!
// const s7_read = (id: number, indexes: number[]): void => {
//   setInterval(async () => {
//     try {
//       const s7_readData = await s7_plc_1.s7_readData(id, indexes);
//       s7_readData.forEach((res, index) => {
//         const data = [...res];
//         console.log(`${getDateAsString()}S7-Read - id ${id}, index ${indexes[index]}: [${data}]`);
//       });
//     } catch (error) {
//       console.log(`${getDateAsString()}S7-Read - Cannot read from PLC id: ${id}: ${error}`);
//     }
//   }, s7_triggetTime);
// };
// const s7_write = (id: number, indexes: number[], dataToWrite: Buffer[]): void => {
//   setInterval(async () => {
//     try {
//       await s7_plc_1.s7_writeData(id, indexes, dataToWrite);
//     } catch (error) {
//       console.log(`${getDateAsString()}S7-Write - Cannot write to PLC id: ${id}: ${error}`);
//     }
//   }, s7_triggetTime * 4.72);
// };
// const s7_data1: Buffer[] = [Buffer.from([0x11, 0x22, 0x33, 0x44]), Buffer.from([0xaa, 0xbb, 0xcc, 0xdd])];
// const s7_data2: Buffer[] = [Buffer.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88]), Buffer.from([0xab, 0xcd, 0xef, 0x98, 0x76, 0x54])];
// s7_read(1, [1, 2, 3]);
// s7_read(2, [1, 2]);
// s7_write(1, [1, 2], s7_data1);
// s7_write(2, [1, 2], s7_data2);

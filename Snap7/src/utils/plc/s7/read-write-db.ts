// import snap7 = require('node-snap7');
// import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
// import { InternalError } from '../../../types/server/errors';
// import { getObjectValue } from '../../get-object-prop';

// export const s7_readAreas = async (s7client: snap7.S7Client, multiVar: snap7.MultiVarRead[]): Promise<snap7.MultiVarsReadResult[]> => {
//   const promise = new Promise<snap7.MultiVarsReadResult[]>((resolve, reject) => {
//     s7client.ReadMultiVars(multiVar, (err, data) => {
//       if (!err && data.every((result) => result.Result === 0)) resolve(data);
//       const errorDataDBValues = JSON.stringify(getObjectValue(multiVar, 'DBNumber'));
//       reject(new InternalError(`Cannot read-write data from-to DBs:${errorDataDBValues}`));
//     });
//   });
//   const timeout = new Promise<never>((_, reject) => {
//     setTimeout(() => {
//       s7client.Disconnect();
//       reject(new InternalError(`Timeout during reading data from PLC`));
//     }, s7_triggetTime / 1.5);
//   });
//   return Promise.race([promise, timeout]);
// };

// export const s7_writeAreas = async (s7client: snap7.S7Client, multiVar: snap7.MultiVarWrite[]): Promise<void> => {
//   const promise = new Promise<void>((resolve, reject) => {
//     s7client.WriteMultiVars(multiVar, (err, data) => {
//       if (!err && data.every((result) => result.Result === 0)) resolve();
//       const errorDataDBValues = JSON.stringify(getObjectValue(multiVar, 'DBNumber'));
//       reject(new InternalError(`Cannot write data to DBs:${errorDataDBValues}`));
//     });
//   });
//   const timeout = new Promise<never>((_, reject) => {
//     setTimeout(() => {
//       s7client.Disconnect();
//       reject(new InternalError(`Timeout during writing data from PLC`));
//     }, s7_triggetTime / 1.5);
//   });
//   return Promise.race([promise, timeout]);
// };

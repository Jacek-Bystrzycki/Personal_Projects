import snap7 = require('node-snap7');
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';

export const readAreas = (s7client: snap7.S7Client, multiVar: snap7.MultiVarRead[]): Promise<snap7.MultiVarsReadResult[]> => {
  const promise = new Promise<snap7.MultiVarsReadResult[]>((resolve, reject) => {
    s7client.ReadMultiVars(multiVar, (err, data) => {
      if (!err && data.every((result) => result.Result === 0)) resolve(data);
      reject('Error during reading from PLC');
    });
  });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      s7client.Disconnect();
      reject('Error during reading from PLC');
    }, s7_triggetTime / 4);
  });
  return Promise.race([promise, timeout]);
};

export const writeAreas = (s7client: snap7.S7Client, multiVar: snap7.MultiVarWrite[]): Promise<void> => {
  const promise = new Promise<void>((resolve, reject) => {
    s7client.WriteMultiVars(multiVar, (err, data) => {
      if (!err && data.every((result) => result.Result === 0)) resolve();
      reject('Error during writing to PLC');
    });
  });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      s7client.Disconnect();
      reject('Error during writing to PLC');
    }, s7_triggetTime / 4);
  });
  return Promise.race([promise, timeout]);
};

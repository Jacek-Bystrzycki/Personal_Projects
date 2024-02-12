import { s7_triggetTime } from '../connections/plc/s7/conn-params';

export const waitUntil = async (res: Function, rej: Function, errorMsg: Function, checkInterval = 100): Promise<void> => {
  const promise = new Promise<void>((resolve, reject) => {
    let interval = setInterval(() => {
      if (!res() && !rej()) return;
      clearInterval(interval);
      if (res()) {
        resolve();
      } else {
        reject(errorMsg());
      }
    }, checkInterval);
  });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject('Timeout');
    }, s7_triggetTime * 5);
  });
  return Promise.race([promise, timeout]);
};

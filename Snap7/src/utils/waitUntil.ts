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
    }, 5000);
  });
  return Promise.race([promise, timeout]);
};

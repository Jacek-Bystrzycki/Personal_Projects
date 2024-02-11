export const waitUntil = async (condition: Function, checkInterval = 100): Promise<void> => {
  const promise = new Promise<void>((resolve) => {
    let interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve();
    }, checkInterval);
  });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject();
    }, 3000);
  });
  return Promise.race([promise, timeout]);
};

export const getObjectValue = <T, K extends keyof T>(object: T[], key: K): T[K][] => {
  return object.map((item) => item[key]);
};

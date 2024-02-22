export const mbIntToWord = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const resp: number[] = [];
    new Uint16Array(data).forEach((value) => resp.push(value));
    return resp;
  } else return [];
};

export const mbUintToWord = (data: number[]): number[] => {
  return mbIntToWord(data);
};

export const mbFloatToDword = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const resp: number[] = [];

    data.forEach((value) => {
      const arr32 = new Float32Array([value]).buffer;
      const arr16 = new Uint16Array(arr32);
      arr16.forEach((word) => resp.push(word));
    });

    return resp;
  } else return [];
};

export const mbFloatInvertedToDword = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const resp: number[] = [];

    data.forEach((value) => {
      const arr32 = new Float32Array([value]).buffer;
      const arr16 = new Uint16Array(arr32).reverse();
      arr16.forEach((word) => {
        resp.push(word);
      });
    });

    return resp;
  } else return [];
};

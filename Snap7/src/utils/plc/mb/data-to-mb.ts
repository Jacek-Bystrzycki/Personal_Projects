import { BadRequestError } from '../../../types/server/errors';

export const mbBitToWordBit = (data: number[], currValue: number[], startAdd: number): number[][] => {
  if (
    Array.isArray(data) &&
    data.length === 1 &&
    (data[0] === 1 || data[0] === 0) &&
    Array.isArray(currValue) &&
    currValue.every((bit) => typeof bit === 'number' && (bit === 1 || bit === 0))
  ) {
    const bitNo: number = startAdd % 16;
    const resp: number[] = currValue.map((bit, index) => {
      if (index === bitNo) return data[0];
      return bit;
    });

    return [resp];
  } else throw new BadRequestError('Wrong bit sequence in payload');
};

export const mb16bitArrayToWord = (data: Array<Array<number>>): number[] => {
  if (
    Array.isArray(data) &&
    data.every((item) => {
      return Array.isArray(item) && item.length === 16 && item.every((bit) => bit === 1 || bit === 0);
    })
  ) {
    const resp: number[] = [];

    data.forEach((item) => {
      let dec: number = 0;
      let factor: number = 1;
      for (let i = 0; i < item.length; i++) {
        if (item[i] === 1) {
          dec += factor;
        }
        factor *= 2;
      }
      const value: number = new Uint32Array([dec])[0];

      resp.push(value);
    });

    return resp;
  } else throw new BadRequestError('Wrong bit sequence in payload');
};

export const mbIntToWord = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const resp: number[] = [];
    new Uint16Array(data).forEach((value) => resp.push(value));
    return resp;
  } else throw new BadRequestError('Wrong data in payload');
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
  } else throw new BadRequestError('Wrong data in payload');
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
  } else throw new BadRequestError('Wrong data in payload');
};

//=============== S7 Write utils =================
import { BadRequestError } from '../../../types/server/errors';

export const bitToBuffer = (data: number[]): Buffer => {
  if (data.length === 1 && (data[0] === 0 || data[0] === 1)) {
    return Buffer.from([data[0]]);
  }
  throw new BadRequestError(`Bit needs to be 0 or 1`);
};

export const bit8ArrayToBuffer = (data: Array<Array<number>>): Buffer => {
  if (
    Array.isArray(data) &&
    data.every((item) => {
      return Array.isArray(item) && item.length === 8 && item.every((bit) => bit === 1 || bit === 0);
    })
  ) {
    const bufferArray: Buffer[] = [];
    data.forEach((item) => {
      let dec: number = 0;
      let factor: number = 1;
      for (let i = 0; i < item.length; i++) {
        if (item[i] === 1) {
          dec += factor;
        }
        factor *= 2;
      }
      bufferArray.push(Buffer.from([dec]));
    });
    return Buffer.concat(bufferArray);
  } else throw new BadRequestError('Wrong bit sequence in payload');
};

export const bit16ArrayToBuffer = (data: Array<Array<number>>): Buffer => {
  if (
    Array.isArray(data) &&
    data.every((item) => {
      return Array.isArray(item) && item.length === 16 && item.every((bit) => bit === 1 || bit === 0);
    })
  ) {
    const bufferArray: Buffer[] = [];
    data.forEach((item) => {
      let dec: number = 0;
      let factor: number = 1;
      for (let i = 0; i < item.length; i++) {
        if (item[i] === 1) {
          dec += factor;
        }
        factor *= 2;
      }
      bufferArray.push(Buffer.from([dec]));
    });
    return Buffer.concat(bufferArray);
  } else throw new BadRequestError('Wrong bit sequence in payload');
};

export const bit32ArrayToBuffer = (data: Array<Array<number>>): Buffer => {
  if (
    Array.isArray(data) &&
    data.every((item) => {
      return Array.isArray(item) && item.length === 32 && item.every((bit) => bit === 1 || bit === 0);
    })
  ) {
    const bufferArray: Buffer[] = [];
    data.forEach((item) => {
      let dec: number = 0;
      let factor: number = 1;
      for (let i = 0; i < item.length; i++) {
        if (item[i] === 1) {
          dec += factor;
        }
        factor *= 2;
      }
      bufferArray.push(Buffer.from([dec]));
    });
    return Buffer.concat(bufferArray);
  } else throw new BadRequestError('Wrong bit sequence in payload');
};

export const byteToIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length);
    data.forEach((entry: number, index: number) => {
      buf.writeInt8(entry, index);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const byteToUIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length);
    data.forEach((entry: number, index: number) => {
      buf.writeUInt8(entry, index);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const wordToIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length * 2);
    data.forEach((entry: number, index: number) => {
      buf.writeInt16BE(entry, index * 2);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const wordToUIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length * 2);
    data.forEach((entry: number, index: number) => {
      buf.writeUInt16BE(entry, index * 2);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const dwordToIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length * 4);
    data.forEach((entry: number, index: number) => {
      buf.writeInt32BE(entry, index * 4);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const dwordToUIntBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length * 4);
    data.forEach((entry: number, index: number) => {
      buf.writeUInt32BE(entry, index * 4);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

export const floatToRealBuffer = (data: number[]): Buffer => {
  if (Array.isArray(data) && data.every((item: any) => typeof item === 'number')) {
    const buf = Buffer.allocUnsafe(data.length * 4);
    data.forEach((entry: number, index: number) => {
      buf.writeFloatBE(entry, index * 4);
    });
    return buf;
  } else throw new BadRequestError('Wrong data in payload');
};

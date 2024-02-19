//=============== S7 Read utils =================

export const bufferByteToBitArray = (data: Buffer): Array<number[]> => {
  if (data.length > 0) {
    const bits: Array<number[]> = [];
    for (let i = 0; i < data.length; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 1, 1);
      const respString: string = buf.readUInt8().toString(2);
      const lenDiff: number = 8 - buf.readUInt8().toString(2).length;
      const bitArray: number[] = Array.from({ length: 8 }).map((_, index) => {
        if (index < lenDiff) return 0;
        return respString[index - lenDiff] === '1' ? 1 : 0;
      });
      bits.push(bitArray.reverse());
    }
    return bits;
  } else return [];
};

export const bufferWordToBitArray = (data: Buffer): Array<number[]> => {
  if (data.length > 1) {
    const bits: Array<number[]> = [];
    for (let i = 0; i < data.length; i += 2) {
      const buf = Buffer.copyBytesFrom(data, i * 1, 2);
      const respString: string = buf.readUInt16BE().toString(2);
      const lenDiff: number = 16 - buf.readUInt16BE().toString(2).length;
      const bitArray: number[] = Array.from({ length: 16 }).map((_, index) => {
        if (index < lenDiff) return 0;
        return respString[index - lenDiff] === '1' ? 1 : 0;
      });
      const word = bitArray.reverse();
      bits.push([...word]);
    }

    return bits;
  } else return [];
};

export const bufferDWordToBitArray = (data: Buffer): Array<number[]> => {
  if (data.length > 3) {
    const bits: Array<number[]> = [];
    for (let i = 0; i < data.length; i += 4) {
      const buf = Buffer.copyBytesFrom(data, i * 1, 4);
      const respString: string = buf.readUInt32BE().toString(2);
      const lenDiff: number = 32 - buf.readUInt32BE().toString(2).length;
      const bitArray: number[] = Array.from({ length: 32 }).map((_, index) => {
        if (index < lenDiff) return 0;
        return respString[index - lenDiff] === '1' ? 1 : 0;
      });
      const dword = bitArray.reverse();
      bits.push([...dword]);
    }
    return bits;
  } else return [];
};

export const bufferByteToInt = (data: Buffer): number[] => {
  if (data.length > 0) {
    const byte: number[] = [];
    const intAmount: number = data.length;
    for (let i = 0; i < intAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 1, 1);
      byte.push(buf.readInt8());
    }
    return byte;
  } else return [];
};

export const bufferByteToUInt = (data: Buffer): number[] => {
  if (data.length > 0) {
    const byte: number[] = [];
    const intAmount: number = data.length;
    for (let i = 0; i < intAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 1, 1);
      byte.push(buf.readUInt8());
    }
    return byte;
  } else return [];
};

export const bufferWordToInt = (data: Buffer): number[] => {
  if (data.length > 1) {
    const int: number[] = [];
    const intAmount: number = data.length / 2;
    for (let i = 0; i < intAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 2, 2);
      int.push(buf.readInt16BE());
    }
    return int;
  } else return [];
};

export const bufferWordToUInt = (data: Buffer): number[] => {
  if (data.length > 1) {
    const int: number[] = [];
    const intAmount: number = data.length / 2;
    for (let i = 0; i < intAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 2, 2);
      int.push(buf.readUInt16BE());
    }
    return int;
  } else return [];
};

export const bufferDwordToInt = (data: Buffer): number[] => {
  if (data.length > 3) {
    const dint: number[] = [];
    const dintAmount: number = data.length / 4;
    for (let i = 0; i < dintAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 4, 4);
      dint.push(buf.readInt32BE());
    }
    return dint;
  } else return [];
};

export const bufferDwordToUInt = (data: Buffer): number[] => {
  if (data.length > 3) {
    const dint: number[] = [];
    const dintAmount: number = data.length / 4;
    for (let i = 0; i < dintAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 4, 4);
      dint.push(buf.readUInt32BE());
    }
    return dint;
  } else return [];
};

export const bufferRealToFloat = (data: Buffer): number[] => {
  if (data.length > 3) {
    const float: number[] = [];
    const floatAmount: number = data.length / 4;
    for (let i = 0; i < floatAmount; i++) {
      const buf = Buffer.copyBytesFrom(data, i * 4, 4);
      float.push(parseFloat(buf.readFloatBE(0).toFixed(5)));
    }
    return float;
  } else return [];
};

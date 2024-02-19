export const mbWordToBit = (data: number[], startAdd: number): number[] => {
  if (Array.isArray(data) && data.length === 1 && data.every((item) => typeof item === 'number')) {
    const bitNo: number = startAdd % 16;
    const bitArr: number[] = mbWordToBitArray(data)[0];
    const bit: number[] = [bitArr[bitNo]];

    return bit;
  } else return [];
};

export const mbWordToBitArray = (data: number[]): Array<number[]> => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const bitArr: number[][] = [];

    const data16Arr = new Uint16Array(data).buffer;
    const data8Arr = new Uint8Array(data16Arr);

    const workBuf = Buffer.copyBytesFrom(data8Arr, 0, data.length * 2).swap16();
    const bitsAmount: number = workBuf.length / 2;

    for (let i = 0; i < bitsAmount; i++) {
      const buf = Buffer.copyBytesFrom(workBuf, i * 2, 2);
      const respString: string = buf.readUInt16BE().toString(2);
      const lenDiff: number = 16 - buf.readUInt16BE().toString(2).length;
      const bitArray: number[] = Array.from({ length: 16 }).map((_, index) => {
        if (index < lenDiff) return 0;
        return respString[index - lenDiff] === '1' ? 1 : 0;
      });
      const word = bitArray.reverse();
      bitArr.push(word);
    }

    return bitArr;
  } else return [];
};

export const mbWordToInt = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const dintArr: number[] = [];
    const dataArr = new Int16Array(data);
    dataArr.forEach((data) => dintArr.push(data));
    return dintArr;
  } else {
    return [];
  }
};

export const mbWordToUint = (data: number[]): number[] => {
  if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
    const dintArr: number[] = [];
    const dataArr = new Uint16Array(data);
    dataArr.forEach((data) => dintArr.push(data));
    return dintArr;
  } else {
    return [];
  }
};

export const mbDwordToFloat = (data: number[]): number[] => {
  if (Array.isArray(data) && data.length % 2 === 0 && data.length > 1 && data.every((item) => typeof item === 'number')) {
    const floatArr: number[] = [];

    const invertedData: number[][] = [];
    for (let i = 0; i < data.length - 1; i += 2) {
      const wordZero = [data[i]];
      const wordOne = [data[i + 1]];
      invertedData.push([...wordOne, ...wordZero].flat());
    }
    const invData = invertedData.flat();

    for (let i = 0; i < invData.length; i += 2) {
      const slicedArr = invData.slice(i, i + 2);
      const data16Arr = new Uint16Array(slicedArr).buffer;
      const data8Arr = new Uint8Array(data16Arr);
      const buf = Buffer.copyBytesFrom(data8Arr, 0, 4).swap16();
      const float = parseFloat(buf.readFloatBE(0).toFixed(5));

      floatArr.push(float);
    }

    return floatArr;
  } else {
    return [];
  }
};

export const mbDwordToFloatInverted = (data: number[]): number[] => {
  if (Array.isArray(data) && data.length % 2 === 0 && data.length > 1 && data.every((item) => typeof item === 'number')) {
    const floatArr: number[] = [];

    for (let i = 0; i < data.length; i += 2) {
      const slicedArr = data.slice(i, i + 2);
      const data16Arr = new Uint16Array(slicedArr).buffer;
      const data8Arr = new Uint8Array(data16Arr);
      const buf = Buffer.copyBytesFrom(data8Arr, 0, 4).swap16();
      const float = parseFloat(buf.readFloatBE(0).toFixed(5));

      floatArr.push(float);
    }

    return floatArr;
  } else {
    return [];
  }
};

import { DataType } from 'node-opcua-client';
import { BadRequestError } from '../../../types/server/errors';

export const uaLimitValue = (value: number, type: DataType): number | boolean => {
  switch (type) {
    case DataType.Boolean:
      return !!value;
    case DataType.Byte:
      if (value > 255) return 255;
      else if (value < 0) return 0;
      else return Math.round(value);
    case DataType.SByte:
      if (value > 127) return 127;
      else if (value < -128) return -128;
      else return Math.round(value);
    case DataType.UInt16:
      if (value > 65535) return 65535;
      else if (value < 0) return 0;
      else return Math.round(value);
    case DataType.UInt32:
      if (value > 4294967295) return 4294967295;
      else if (value < 0) return 0;
      else return Math.round(value);
    case DataType.Int16:
      if (value > 32767) return 32767;
      else if (value < -32768) return -32768;
      else return Math.round(value);
    case DataType.Int32:
      if (value > 2147483647) return 2147483647;
      else if (value < -2147483648) return -2147483648;
      else return Math.round(value);
    case DataType.Float:
      return value;
    case DataType.Double:
      return value;
    default:
      throw new BadRequestError('Unsupported data type');
  }
};

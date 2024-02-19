import type { MB_BeforeFormatRead, MB_AfterFormatRead } from '../../../types/plc/mb/request';
import { BadRequestError } from '../../../types/server/errors';
import { mbWordToBit, mbWordToBitArray, mbWordToUint, mbWordToInt, mbDwordToFloat, mbDwordToFloatInverted } from '../../../utils/plc/mb/mb-to-data';

export const mb_formatReadData = (resp: MB_BeforeFormatRead[]): MB_AfterFormatRead[] => {
  if (resp) {
    const readTags: MB_AfterFormatRead[] = resp.map((tag) => {
      return { isError: tag.isError, status: tag.status, id: tag.id, len: tag.len, format: tag.format, address: tag.address, values: [] };
    });

    readTags.forEach((tag) => {
      switch (tag.len) {
        case 'Bit':
          if (tag.format === 'Bit') {
            tag.values = mbWordToBit(
              resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[],
              resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.address.holdingRegister!
            );
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case 'Word':
          if (tag.format === 'Word_As_BitArray') {
            tag.values = mbWordToBitArray(resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[]);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            tag.values = mbWordToInt(resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[]);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            tag.values = mbWordToUint(resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[]);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case 'Dword':
          if (tag.format === 'Float') {
            tag.values = mbDwordToFloat(resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[]);
            break;
          }
          if (tag.format === 'FloatInverted') {
            tag.values = mbDwordToFloatInverted(resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data as number[]);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });

    return readTags;
  } else {
    throw new BadRequestError('Empty data');
  }
};

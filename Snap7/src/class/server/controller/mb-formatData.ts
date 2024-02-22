import type { MB_BeforeFormatRead, MB_AfterFormatRead, MB_AfterFormatWrite, MB_BeforeFormatWrite, MB_DataResponseWrite } from '../../../types/plc/mb/request';
import { BadRequestError } from '../../../types/server/errors';
import { mbWordToBit, mbWordToBitArray, mbWordToUint, mbWordToInt, mbDwordToFloat, mbDwordToFloatInverted } from '../../../utils/plc/mb/mb-to-data';
import { mbBitToWordBit, mb16bitArrayToWord, mbIntToWord, mbUintToWord, mbFloatToDword, mbFloatInvertedToDword } from '../../../utils/plc/mb/data-to-mb';

export const mb_formatReadData = (resp: MB_BeforeFormatRead[]): MB_AfterFormatRead[] => {
  if (resp) {
    const readTags: MB_AfterFormatRead[] = resp.map((tag) => {
      return { isError: tag.isError, status: tag.status, id: tag.id, len: tag.len, format: tag.format, address: tag.address, values: [] };
    });

    readTags.forEach((tag) => {
      const currentTag: number[] = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data!;
      switch (tag.len) {
        case 'Bit':
          if (tag.format === 'Bit') {
            tag.values = mbWordToBit(
              currentTag,
              resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.address.holdingRegister!
            );
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case 'Word':
          if (tag.format === 'Word_As_BitArray') {
            tag.values = mbWordToBitArray(currentTag);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            tag.values = mbWordToInt(currentTag);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            tag.values = mbWordToUint(currentTag);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case 'Dword':
          if (tag.format === 'Float') {
            tag.values = mbDwordToFloat(currentTag);
            break;
          }
          if (tag.format === 'FloatInverted') {
            tag.values = mbDwordToFloatInverted(currentTag);
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

export const mb_formatWriteData = (id: number, writeTags: MB_BeforeFormatWrite[]): MB_AfterFormatWrite => {
  const values: number[][] = [];

  writeTags.forEach((tag) => {
    switch (tag.len) {
      case 'Bit':
        if (tag.format == 'Bit') {
          const currWord = mbWordToBitArray(tag.bitDataForRead!)[0];
          const tempArr: number[][] = mbBitToWordBit(tag.data as number[], currWord, tag.startAddForRead!);
          values.push(mb16bitArrayToWord(tempArr as number[][]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case 'Word':
        if (tag.format === 'Word_As_BitArray') {
          values.push(mb16bitArrayToWord(tag.data as number[][]));
          break;
        }
        if (tag.format === 'Word_As_Int') {
          values.push(mbIntToWord(tag.data as number[]));
          break;
        }
        if (tag.format === 'Word_As_Uint') {
          values.push(mbUintToWord(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case 'Dword':
        if (tag.format === 'Float') {
          values.push(mbFloatToDword(tag.data as number[]));
          break;
        }
        if (tag.format === 'FloatInverted') {
          values.push(mbFloatInvertedToDword(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      default:
        throw new BadRequestError('Unsupported data type');
    }
  });

  const respTags: MB_DataResponseWrite[] = values.map((data, index): MB_DataResponseWrite => {
    return { data, tagId: writeTags[index].id };
  });
  const resp: MB_AfterFormatWrite = { instanceId: id, writeTags: respTags };
  return resp;
};

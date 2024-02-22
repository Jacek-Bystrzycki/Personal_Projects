import snap7 = require('node-snap7');
import type { S7_BeforeFormatRead, S7_AfterFormatRead, S7_BeforeFormatWrite, S7_AfterFormatWrite, S7_DataResponseWrite } from '../../../types/plc/s7/request';
import { BadRequestError } from '../../../types/server/errors';
import {
  bufferByteToBitArray,
  bufferWordToBitArray,
  bufferDWordToBitArray,
  bufferByteToInt,
  bufferByteToUInt,
  bufferWordToInt,
  bufferWordToUInt,
  bufferDwordToInt,
  bufferDwordToUInt,
  bufferRealToFloat,
} from '../../../utils/plc/s7/buffer-to-data';
import {
  bitToBuffer,
  bit8ArrayToBuffer,
  bit16ArrayToBuffer,
  bit32ArrayToBuffer,
  byteToIntBuffer,
  byteToUIntBuffer,
  wordToIntBuffer,
  wordToUIntBuffer,
  dwordToIntBuffer,
  dwordToUIntBuffer,
  floatToRealBuffer,
} from '../../../utils/plc/s7/data-to-buffer';

export const s7_formatReadData = (resp: S7_BeforeFormatRead[]): S7_AfterFormatRead[] => {
  if (resp) {
    const readTags: S7_AfterFormatRead[] = resp.map((tag) => {
      return { isError: tag.isError, status: tag.status, id: tag.id, format: tag.format, address: tag.address, wordLen: tag.wordLen, values: [] };
    });

    readTags.forEach((tag) => {
      const currentTag: Buffer = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)?.data!;
      switch (tag.wordLen) {
        case snap7.WordLen.S7WLBit:
          if (tag.format === 'Bit') {
            tag.values = [...currentTag];
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLByte:
          if (tag.format === 'Byte_As_BitArray') {
            tag.values = bufferByteToBitArray(currentTag);
            break;
          }
          if (tag.format === 'Byte_As_Int') {
            tag.values = bufferByteToInt(currentTag);
            break;
          }
          if (tag.format === 'Byte_As_Uint') {
            tag.values = bufferByteToUInt(currentTag);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLWord:
          if (tag.format === 'Word_As_BitArray') {
            tag.values = bufferWordToBitArray(currentTag);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            tag.values = bufferWordToInt(currentTag);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            tag.values = bufferWordToUInt(currentTag);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLDWord:
          if (tag.format === 'Dword_As_BitArray') {
            tag.values = bufferDWordToBitArray(currentTag);
            break;
          }
          if (tag.format === 'Dword_As_Int') {
            tag.values = bufferDwordToInt(currentTag);
            break;
          }
          if (tag.format === 'Dword_As_Uint') {
            tag.values = bufferDwordToUInt(currentTag);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLReal:
          if (tag.format === 'Real') {
            tag.values = bufferRealToFloat(currentTag);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });

    return readTags;
  } else throw new BadRequestError('Empty data');
};

export const s7_formatWriteData = (id: number, writeTags: S7_BeforeFormatWrite[]): S7_AfterFormatWrite => {
  const buffers: Buffer[] = [];

  writeTags.forEach((tag) => {
    switch (tag.type) {
      case snap7.WordLen.S7WLBit:
        if (tag.format === 'Bit') {
          buffers.push(bitToBuffer(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLByte:
        if (tag.format === 'Byte_As_BitArray') {
          buffers.push(bit8ArrayToBuffer(tag.data as number[][]));
          break;
        }
        if (tag.format === 'Byte_As_Int') {
          buffers.push(byteToIntBuffer(tag.data as number[]));
          break;
        }
        if (tag.format === 'Byte_As_Uint') {
          buffers.push(byteToUIntBuffer(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLWord:
        if (tag.format === 'Word_As_BitArray') {
          buffers.push(bit16ArrayToBuffer(tag.data as number[][]));
          break;
        }
        if (tag.format === 'Word_As_Int') {
          buffers.push(wordToIntBuffer(tag.data as number[]));
          break;
        }
        if (tag.format === 'Word_As_Uint') {
          buffers.push(wordToUIntBuffer(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLDWord:
        if (tag.format === 'Dword_As_BitArray') {
          buffers.push(bit32ArrayToBuffer(tag.data as number[][]));
          break;
        }
        if (tag.format === 'Dword_As_Int') {
          buffers.push(dwordToIntBuffer(tag.data as number[]));
          break;
        }
        if (tag.format === 'Dword_As_Uint') {
          buffers.push(dwordToUIntBuffer(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLReal:
        if (tag.format === 'Real') {
          buffers.push(floatToRealBuffer(tag.data as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      default:
        throw new BadRequestError('Unsupported data type');
    }
  });

  const respTags: S7_DataResponseWrite[] = buffers.map((data, index): S7_DataResponseWrite => {
    return { data, tagId: writeTags[index].id };
  });

  const resp: S7_AfterFormatWrite = { instanceId: id, writeTags: respTags };
  return resp;
};

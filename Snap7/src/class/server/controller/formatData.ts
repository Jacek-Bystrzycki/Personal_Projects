import snap7 = require('node-snap7');
import type {
  S7_BeforeFormatRead,
  S7_AfterFormatRead,
  S7_DataResponseRead,
  S7_BeforeFormatWrite,
  S7_AfterFormatWrite,
  S7_DataResponseWrite,
} from '../../../types/plc/s7/request';
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
    const data: S7_DataResponseRead[] = [];
    const readTags = resp.map((tag) => {
      return {
        type: tag.wordLen,
        format: tag.format,
        id: tag.id,
        amount: tag.amount,
      };
    });

    readTags.forEach((tag) => {
      switch (tag.type) {
        case snap7.WordLen.S7WLBit:
          if (tag.format === 'Bit') {
            const singleData: S7_DataResponseRead = { values: [...resp.find((resp) => resp.id === tag.id)?.data!], amount: tag.amount };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLByte:
          if (tag.format === 'Byte_As_BitArray') {
            const singleData: S7_DataResponseRead = { values: bufferByteToBitArray(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Int') {
            const singleData: S7_DataResponseRead = { values: bufferByteToInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Uint') {
            const singleData: S7_DataResponseRead = { values: bufferByteToUInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLWord:
          if (tag.format === 'Word_As_BitArray') {
            const singleData: S7_DataResponseRead = { values: bufferWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            const singleData: S7_DataResponseRead = { values: bufferWordToInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            const singleData: S7_DataResponseRead = { values: bufferWordToUInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLDWord:
          if (tag.format === 'Dword_As_BitArray') {
            const singleData: S7_DataResponseRead = { values: bufferDWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Int') {
            const singleData: S7_DataResponseRead = { values: bufferDwordToInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Uint') {
            const singleData: S7_DataResponseRead = { values: bufferDwordToUInt(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLReal:
          if (tag.format === 'Real') {
            const singleData: S7_DataResponseRead = { values: bufferRealToFloat(resp.find((resp) => resp.id === tag.id)?.data!), amount: tag.amount };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });

    const dataResponse: S7_AfterFormatRead[] = data.map((singleData, index): S7_AfterFormatRead => {
      return {
        id: resp[index].id,
        status: resp[index].status,
        isError: resp[index].isError,
        format: resp[index].format,
        amount: singleData.amount,
        values: singleData.values,
      };
    });
    return dataResponse;
  } else throw new BadRequestError('Empty data');
};

export const s7_formatWriteData = (id: number, writeTags: S7_BeforeFormatWrite[], data: Array<Array<number> | Array<Array<number>>>): S7_AfterFormatWrite => {
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

  const respTags: S7_DataResponseWrite[] = buffers.map((data, index) => {
    return { data, tagId: writeTags[index].id };
  });

  const resp: S7_AfterFormatWrite = { instanceId: id, writeTags: respTags };
  return resp;
};

// export const mb_formatReadData = (context: S7_CreateConnections, resp: S7_BeforeFormat[] | undefined, numId: number, tags: number[]): S7_AfterFormat[] => {}

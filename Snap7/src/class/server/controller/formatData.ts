import snap7 = require('node-snap7');
import type { S7_CreateConnections } from '../../plc/s7/create-plc-connections';
import type { S7_BeforeFormat, S7_AfterFormat, S7_DataResponse } from '../../../types/plc/s7/respose';
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

export const s7_formatReadData = (context: S7_CreateConnections, resp: S7_BeforeFormat[] | undefined, numId: number, tags: number[]): S7_AfterFormat[] => {
  if (resp) {
    const data: S7_DataResponse[] = [];
    const readTags = tags.map((index) => {
      return {
        type: context.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.params.WordLen,
        format: context.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.format,
        id: context.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.id!,
      };
    });
    readTags.forEach((tag) => {
      switch (tag.type) {
        case snap7.WordLen.S7WLBit:
          if (tag.format === 'Bit') {
            const singleData: S7_DataResponse = { values: [...resp.find((resp) => resp.id === tag.id)?.data!] };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLByte:
          if (tag.format === 'Byte_As_BitArray') {
            const singleData: S7_DataResponse = { values: bufferByteToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Int') {
            const singleData: S7_DataResponse = { values: bufferByteToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Uint') {
            const singleData: S7_DataResponse = { values: bufferByteToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLWord:
          if (tag.format === 'Word_As_BitArray') {
            const singleData: S7_DataResponse = { values: bufferWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            const singleData: S7_DataResponse = { values: bufferWordToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            const singleData: S7_DataResponse = { values: bufferWordToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLDWord:
          if (tag.format === 'Dword_As_BitArray') {
            const singleData: S7_DataResponse = { values: bufferDWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Int') {
            const singleData: S7_DataResponse = { values: bufferDwordToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Uint') {
            const singleData: S7_DataResponse = { values: bufferDwordToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLReal:
          if (tag.format === 'Real') {
            const singleData: S7_DataResponse = { values: bufferRealToFloat(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });

    const dataResponse: S7_AfterFormat[] = data.map((singleData, index): S7_AfterFormat => {
      return {
        isError: resp[index].isError,
        status: resp[index].status,
        id: resp[index].id,
        values: singleData.values,
      };
    });
    return dataResponse;
  } else throw new BadRequestError('Empty data');
};

export const s7_formatWriteData = (
  context: S7_CreateConnections,
  id: number,
  tags: number[],
  data: Array<Array<number> | Array<Array<number>>>
): Buffer[] | undefined => {
  const buffers: Buffer[] = [];

  const writeTags = tags.map((index, i) => {
    return {
      type: context.instances[id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.params.WordLen,
      format: context.instances[id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.format,
      id: context.instances[id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.id,
      index: i,
    };
  });
  writeTags.forEach((tag) => {
    switch (tag.type) {
      case snap7.WordLen.S7WLBit:
        if (tag.format === 'Bit') {
          buffers.push(bitToBuffer(data[tag.index] as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLByte:
        if (tag.format === 'Byte_As_BitArray') {
          buffers.push(bit8ArrayToBuffer(data[tag.index] as number[][]));
          break;
        }
        if (tag.format === 'Byte_As_Int') {
          buffers.push(byteToIntBuffer(data[tag.index] as number[]));
          break;
        }
        if (tag.format === 'Byte_As_Uint') {
          buffers.push(byteToUIntBuffer(data[tag.index] as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLWord:
        if (tag.format === 'Word_As_BitArray') {
          buffers.push(bit16ArrayToBuffer(data[tag.index] as number[][]));
          break;
        }
        if (tag.format === 'Word_As_Int') {
          buffers.push(wordToIntBuffer(data[tag.index] as number[]));
          break;
        }
        if (tag.format === 'Word_As_Uint') {
          buffers.push(wordToUIntBuffer(data[tag.index] as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLDWord:
        if (tag.format === 'Dword_As_BitArray') {
          buffers.push(bit32ArrayToBuffer(data[tag.index] as number[][]));
          break;
        }
        if (tag.format === 'Dword_As_Int') {
          buffers.push(dwordToIntBuffer(data[tag.index] as number[]));
          break;
        }
        if (tag.format === 'Dword_As_Uint') {
          buffers.push(dwordToUIntBuffer(data[tag.index] as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLReal:
        if (tag.format === 'Real') {
          buffers.push(floatToRealBuffer(data[tag.index] as number[]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      default:
        throw new BadRequestError('Unsupported data type');
    }
  });
  return buffers;
};

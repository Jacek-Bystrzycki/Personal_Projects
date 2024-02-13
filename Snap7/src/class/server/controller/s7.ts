import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { CustomServer } from '../custom-server';
import snap7 = require('node-snap7');
import type { BeforeFormat, AfterFormat, DataResponse } from '../../../types/plc/s7/respose';
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
import { log } from 'console';

export class S7_Controller {
  constructor(private readonly instance: CustomServer) {}
  public read = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { tags } = req.query;
    const queryExists: boolean = Object.keys(req.query).length > 0;
    try {
      const numId = parseInt(id, 10);
      if (!this.instance.devices.s7_definitions?.instances[numId - 1]) throw new BadRequestError(`Instance ${id} not exists`);
      const allIndexes: number[] | undefined = this.instance.devices.s7_definitions?.instances[numId - 1].instance.readBufferConsistent.map((tag) => tag.id);
      const indexes = queryExists ? tags : JSON.stringify(allIndexes);
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong tags');
      const indexesNumber: unknown = JSON.parse(indexes);
      if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number'))) throw new BadRequestError('Tag must be a number');
      indexesNumber.forEach((index) => {
        if (this.instance.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.findIndex((tag) => tag.id === index) === -1)
          throw new BadRequestError(`Not all tags [${index}] exist in params definitions`);
      });
      const resp: BeforeFormat[] = this.instance.devices.s7_definitions?.s7_readData(numId, indexesNumber);
      const data: AfterFormat[] = readData(this.instance, resp, numId, indexesNumber);
      res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { tags } = req.query;
    const indexes = tags;
    const { data } = req.body;
    try {
      const { numId, indexesNumber, buffers } = writeData(this.instance, id, indexes, data)!;
      this.instance.devices.s7_definitions?.s7_writeData(numId, indexesNumber, buffers);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { tags } = req.query;
    const indexes = tags;
    const { data } = req.body;
    try {
      const { numId, indexesNumber, buffers } = writeData(this.instance, id, indexes, data)!;
      await this.instance.devices.s7_definitions?.s7_writeDataSync(numId, indexesNumber, buffers);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

//=============================================================================

const readData = (context: CustomServer, resp: BeforeFormat[] | undefined, numId: number, indexesNumber: number[]): AfterFormat[] => {
  if (resp) {
    const data: DataResponse[] = [];
    const readTags = indexesNumber.map((index) => {
      return {
        type: context.devices.s7_definitions?.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.params.WordLen,
        format: context.devices.s7_definitions?.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.format,
        id: context.devices.s7_definitions?.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.id!,
      };
    });
    readTags.forEach((tag) => {
      switch (tag.type) {
        case snap7.WordLen.S7WLBit:
          if (tag.format === 'Bit') {
            const singleData: DataResponse = { values: [...resp.find((resp) => resp.id === tag.id)?.data!] };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLByte:
          if (tag.format === 'Byte_As_BitArray') {
            const singleData: DataResponse = { values: bufferByteToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Int') {
            const singleData: DataResponse = { values: bufferByteToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Byte_As_Uint') {
            const singleData: DataResponse = { values: bufferByteToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLWord:
          if (tag.format === 'Word_As_BitArray') {
            const singleData: DataResponse = { values: bufferWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Int') {
            const singleData: DataResponse = { values: bufferWordToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Word_As_Uint') {
            const singleData: DataResponse = { values: bufferWordToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLDWord:
          if (tag.format === 'Dword_As_BitArray') {
            const singleData: DataResponse = { values: bufferDWordToBitArray(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Int') {
            const singleData: DataResponse = { values: bufferDwordToInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          if (tag.format === 'Dword_As_Uint') {
            const singleData: DataResponse = { values: bufferDwordToUInt(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        case snap7.WordLen.S7WLReal:
          if (tag.format === 'Real') {
            const singleData: DataResponse = { values: bufferRealToFloat(resp.find((resp) => resp.id === tag.id)?.data!) };
            data.push(singleData);
            break;
          }
          throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });

    const dataResponse: AfterFormat[] = data.map((singleData, index): AfterFormat => {
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

const writeData = (
  context: CustomServer,
  id: string,
  indexes: unknown,
  data: unknown
): { numId: number; indexesNumber: number[]; buffers: Buffer[] } | undefined => {
  if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
    throw new BadRequestError('Wrong data payload');
  if (typeof indexes !== 'string') throw new BadRequestError('Wrong tags');
  const numId = parseInt(id, 10);
  const indexesNumber: unknown = JSON.parse(indexes);
  const buffers: Buffer[] = [];
  if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number'))) throw new BadRequestError('Wrong tags');
  if (!context.devices.s7_definitions?.instances[numId - 1]) throw new BadRequestError(`Instance ${numId} not exists`);

  const writeTags = indexesNumber.map((index, i) => {
    if (context.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.findIndex((tag) => tag.id === index) === -1)
      throw new BadRequestError(`Not all tags [${index}] exist in params definitions`);
    if (context.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.params.Amount !== data[i].length)
      throw new BadRequestError(`Wrong amount of data in at least one of the data payload`);
    if (indexesNumber.length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
    return {
      type: context.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.params.WordLen,
      format: context.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.format,
      id: context.devices.s7_definitions?.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.id,
      index: i,
    };
  });
  writeTags.forEach((tag) => {
    switch (tag.type) {
      case snap7.WordLen.S7WLBit:
        if (tag.format === 'Bit') {
          buffers.push(bitToBuffer(data[tag.index]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLByte:
        if (tag.format === 'Byte_As_BitArray') {
          buffers.push(bit8ArrayToBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Byte_As_Int') {
          buffers.push(byteToIntBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Byte_As_Uint') {
          buffers.push(byteToUIntBuffer(data[tag.index]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLWord:
        if (tag.format === 'Word_As_BitArray') {
          buffers.push(bit16ArrayToBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Word_As_Int') {
          buffers.push(wordToIntBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Word_As_Uint') {
          buffers.push(wordToUIntBuffer(data[tag.index]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLDWord:
        if (tag.format === 'Dword_As_BitArray') {
          buffers.push(bit32ArrayToBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Dword_As_Int') {
          buffers.push(dwordToIntBuffer(data[tag.index]));
          break;
        }
        if (tag.format === 'Dword_As_Uint') {
          buffers.push(dwordToUIntBuffer(data[tag.index]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      case snap7.WordLen.S7WLReal:
        if (tag.format === 'Real') {
          buffers.push(floatToRealBuffer(data[tag.index]));
          break;
        }
        throw new BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
      default:
        throw new BadRequestError('Unsupported data type');
    }
  });
  return { numId, indexesNumber, buffers };
};

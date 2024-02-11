import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { CustomServer } from '../custom-server';
import snap7 = require('node-snap7');
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

export class S7_Controller {
  constructor(private readonly instance: CustomServer) {}
  public read = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { tags } = req.query;
    const queryExists: boolean = Object.keys(req.query).length > 0;
    const numId = parseInt(id, 10);
    const allIndexes: number[] | undefined = this.instance.devices.s7_definitions?.instances[numId - 1].instance.readBuffer.map((_, index) => index + 1);
    const indexes = queryExists ? tags : JSON.stringify(allIndexes);
    try {
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
      const indexesNumber: unknown = JSON.parse(indexes);
      if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number'))) throw new BadRequestError('indexes with formats');

      const resp = this.instance.devices.s7_definitions?.s7_readData(numId, indexesNumber);
      if (resp) {
        const data: Array<number | Array<number | Array<number>>> = [];
        const types = indexesNumber.map((index) => {
          return this.instance.devices.s7_definitions?.instances[numId - 1].instance.readBuffer[index - 1].params.WordLen;
        });
        const formats = indexesNumber.map((index) => {
          return this.instance.devices.s7_definitions?.instances[numId - 1].instance.readBuffer[index - 1].format;
        });
        types.forEach((type, index) => {
          switch (type) {
            case snap7.WordLen.S7WLBit:
              if (formats[index] === 'Bit') {
                data.push(...resp[index]);
                break;
              }
              throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
            case snap7.WordLen.S7WLByte:
              if (formats[index] === 'Byte_As_BitArray') {
                data.push(bufferByteToBitArray(resp[index]));
                break;
              }
              if (formats[index] === 'Byte_As_Int') {
                data.push(bufferByteToInt(resp[index]));
                break;
              }
              if (formats[index] === 'Byte_As_Uint') {
                data.push(bufferByteToUInt(resp[index]));
                break;
              }
              throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
            case snap7.WordLen.S7WLWord:
              if (formats[index] === 'Word_As_BitArray') {
                data.push(bufferWordToBitArray(resp[index]));
                break;
              }
              if (formats[index] === 'Word_As_Int') {
                data.push(bufferWordToInt(resp[index]));
                break;
              }
              if (formats[index] === 'Word_As_Uint') {
                data.push(bufferWordToUInt(resp[index]));
                break;
              }
              throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
            case snap7.WordLen.S7WLDWord:
              if (formats[index] === 'Dword_As_BitArray') {
                data.push(bufferDWordToBitArray(resp[index]));
                break;
              }
              if (formats[index] === 'Dword_As_Int') {
                data.push(bufferDwordToInt(resp[index]));
                break;
              }
              if (formats[index] === 'Dword_As_Uint') {
                data.push(bufferDwordToUInt(resp[index]));
                break;
              }
              throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
            case snap7.WordLen.S7WLReal:
              if (formats[index] === 'Real') {
                data.push(bufferRealToFloat(resp[index]));
                break;
              }
              throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
            default:
              throw new BadRequestError('Unsupported data type');
          }
        });
        res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
      } else throw new BadRequestError('Empty data');
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

const writeData = (
  context: CustomServer,
  id: string,
  indexes: unknown,
  data: unknown
): { numId: number; indexesNumber: number[]; buffers: Buffer[] } | undefined => {
  if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
    throw new BadRequestError('Wrong data payload');
  if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
  const numId = parseInt(id, 10);
  const indexesNumber: unknown = JSON.parse(indexes);
  const buffers: Buffer[] = [];
  if (Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')) {
    const types = indexesNumber.map((index, i) => {
      if (!context.devices.s7_definitions?.instances[numId - 1]) throw new BadRequestError(`Instance ${numId} not exists`);
      if (!context.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1])
        throw new BadRequestError(`Not all indexes [${index}] exist in params definitions`);
      if (context.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1].params.Amount !== data[i].length)
        throw new BadRequestError(`Wrong amount of data in at least one of the data payload`);
      if (indexesNumber.length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
      return context.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1].params.WordLen;
    });
    const formats = indexesNumber.map((index) => {
      return context.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1].format;
    });
    types.forEach((type, index) => {
      switch (type) {
        case snap7.WordLen.S7WLBit:
          if (formats[index] === 'Bit') {
            buffers.push(bitToBuffer(data[index]));
            break;
          }
          throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
        case snap7.WordLen.S7WLByte:
          if (formats[index] === 'Byte_As_BitArray') {
            buffers.push(bit8ArrayToBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Byte_As_Int') {
            buffers.push(byteToIntBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Byte_As_Uint') {
            buffers.push(byteToUIntBuffer(data[index]));
            break;
          }
          throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
        case snap7.WordLen.S7WLWord:
          if (formats[index] === 'Word_As_BitArray') {
            buffers.push(bit16ArrayToBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Word_As_Int') {
            buffers.push(wordToIntBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Word_As_Uint') {
            buffers.push(wordToUIntBuffer(data[index]));
            break;
          }
          throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
        case snap7.WordLen.S7WLDWord:
          if (formats[index] === 'Dword_As_BitArray') {
            buffers.push(bit32ArrayToBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Dword_As_Int') {
            buffers.push(dwordToIntBuffer(data[index]));
            break;
          }
          if (formats[index] === 'Dword_As_Uint') {
            buffers.push(dwordToUIntBuffer(data[index]));
            break;
          }
          throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
        case snap7.WordLen.S7WLReal:
          if (formats[index] === 'Real') {
            buffers.push(floatToRealBuffer(data[index]));
            break;
          }
          throw new BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
        default:
          throw new BadRequestError('Unsupported data type');
      }
    });
    return { numId, indexesNumber, buffers };
  }
};

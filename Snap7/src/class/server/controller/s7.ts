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
    const { indexes } = req.query;
    try {
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
      const numId = parseInt(id, 10);
      const resp = this.instance.devices.s7_definitions?.s7_readData(numId, JSON.parse(indexes));
      if (resp) {
        const data: Array<number | Array<number | Array<number>>> = [];
        const indexesNumber: unknown = JSON.parse(indexes);
        if (Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')) {
          const types = indexesNumber.map((index) => {
            return this.instance.devices.s7_definitions?.instances[numId - 1].instance.readBuffer[index - 1].params.WordLen;
          });
          types.forEach((type, index) => {
            switch (type) {
              case snap7.WordLen.S7WLByte:
                data.push(bufferByteToBitArray(resp[index]));
                // data.push(bufferByteToInt(resp[index]));
                // data.push(bufferByteToUInt(resp[index]));
                break;
              case snap7.WordLen.S7WLWord:
                // data.push(bufferWordToBitArray(resp[index]));
                data.push(bufferWordToInt(resp[index]));
                // data.push(bufferWordToUInt(resp[index]));
                break;
              case snap7.WordLen.S7WLDWord:
                // data.push(bufferDWordToBitArray(resp[index]));
                data.push(bufferDwordToInt(resp[index]));
                // data.push(bufferDwordToUInt(resp[index]));
                break;
              case snap7.WordLen.S7WLReal:
                data.push(bufferRealToFloat(resp[index]));
                break;
              default:
                throw new BadRequestError('Unsupported data type');
            }
          });
        }
        res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
      } else throw new BadRequestError('Empty data');
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { indexes } = req.query;
    const { data } = req.body;
    try {
      if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
        throw new BadRequestError('Wrong data payload');
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
      const numId = parseInt(id, 10);
      const indexesNumber: unknown = JSON.parse(indexes);
      const buffers: Buffer[] = [];
      if (Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')) {
        const types = indexesNumber.map((index, i) => {
          if (!this.instance.devices.s7_definitions?.instances[numId - 1]) throw new BadRequestError(`Instance ${numId} not exists`);
          if (!this.instance.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1])
            throw new BadRequestError(`Not all indexes [${index}] exist in params definitions`);
          if (this.instance.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1].params.Amount !== data[i].length)
            throw new BadRequestError(`Wrong amount of data in at least one of the data payload`);
          if (indexesNumber.length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
          return this.instance.devices.s7_definitions?.instances[numId - 1].instance.writeBuffer[index - 1].params.WordLen;
        });
        types.forEach((type, index) => {
          switch (type) {
            case snap7.WordLen.S7WLBit:
              buffers.push(bitToBuffer(data[index]));
              break;
            case snap7.WordLen.S7WLByte:
              // buffers.push(byteToIntBuffer(data[index]));
              // buffers.push(byteToUIntBuffer(data[index]));
              buffers.push(bit8ArrayToBuffer(data[index]));
              break;
            case snap7.WordLen.S7WLWord:
              // buffers.push(bit16ArrayToBuffer(data[index]));
              // buffers.push(wordToIntBuffer(data[index]));
              buffers.push(wordToUIntBuffer(data[index]));
              break;
            case snap7.WordLen.S7WLDWord:
              // buffers.push(bit32ArrayToBuffer(data[index]));
              // buffers.push(dwordToIntBuffer(data[index]));
              buffers.push(dwordToUIntBuffer(data[index]));
              break;
            case snap7.WordLen.S7WLReal:
              buffers.push(floatToRealBuffer(data[index]));
              break;
            default:
              throw new BadRequestError('Unsupported data type');
          }
        });
        this.instance.devices.s7_definitions?.s7_writeData(numId, indexesNumber, buffers);
        res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
      }
    } catch (error) {
      next(error);
    }
  };
}

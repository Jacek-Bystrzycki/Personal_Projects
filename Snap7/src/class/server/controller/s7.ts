import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { S7_CreateConnections } from '../../plc/s7/create-plc-connections';
import type { S7_BeforeFormatRead, S7_AfterFormatRead, S7_AfterFormatWrite, S7_BeforeFormatWrite } from '../../../types/plc/s7/request';
import { verifyParams } from './verifyQueryParams';
import { s7_formatReadData, s7_formatWriteData } from './formatData';

export class S7_Controller {
  constructor(private readonly instance: S7_CreateConnections) {}

  public verifyS7Params = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { numId, numTags } = verifyParams(req, this.instance)!;
      req.id = numId;
      req.tags = numTags;
      next();
    } catch (error) {
      next(error);
    }
  };

  public verifyS7Payload = (req: Request, res: Response, next: NextFunction): void => {
    const { data } = req.body;
    try {
      if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
        throw new BadRequestError('Wrong data payload');
      if (req.tags.length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
      req.tags.forEach((index, i) => {
        if (this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)?.params.Amount !== data[i].length)
          throw new BadRequestError(`Wrong amount of data in at least one of the data payload`);
      });
      req.data = data;
      next();
    } catch (error) {
      next(error);
    }
  };

  public read = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data: S7_BeforeFormatRead[] = this.instance.s7_readData(req.id, req.tags);
      const response: S7_AfterFormatRead[] = s7_formatReadData(data);
      res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, amount: response.length, response });
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const writeTags: S7_BeforeFormatWrite[] = req.tags.map((index, i) => {
      return {
        type: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.params.WordLen,
        format: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.format,
        id: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.id,
        data: req.data[i],
      };
    });

    try {
      const data: S7_AfterFormatWrite = s7_formatWriteData(req.id, writeTags, req.data);
      this.instance.s7_writeData(data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const writeTags: S7_BeforeFormatWrite[] = req.tags.map((index, i) => {
      return {
        type: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.params.WordLen,
        format: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.format,
        id: this.instance.instances[req.id - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)!.id,
        data: req.data[i],
      };
    });

    try {
      const data: S7_AfterFormatWrite = s7_formatWriteData(req.id, writeTags, req.data);
      await this.instance.s7_writeDataSync(data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

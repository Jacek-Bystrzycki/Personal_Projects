import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { S7_CreateConnections } from '../../plc/s7/create-plc-connections';
import type { S7_BeforeFormat, S7_AfterFormat } from '../../../types/plc/s7/respose';
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
      const resp: S7_BeforeFormat[] = this.instance.s7_readData(req.id, req.tags);
      const data: S7_AfterFormat[] = s7_formatReadData(this.instance, resp, req.id, req.tags);
      res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const buffers: Buffer[] = s7_formatWriteData(this.instance, req.id, req.tags, req.data)!;
      this.instance.s7_writeData(req.id, req.tags, buffers);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffers: Buffer[] = s7_formatWriteData(this.instance, req.id, req.tags, req.data)!;
      await this.instance.s7_writeDataSync(req.id, req.tags, buffers);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

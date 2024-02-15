import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import type { MB_CreateConnections } from '../../plc/mb/create-mb-connection';
import { verifyParams } from './verifyQueryParams';
import type { MB_BeforeFormat } from '../../../types/plc/mb/request';

export class MB_Controller {
  constructor(private readonly instance: MB_CreateConnections) {}

  public verifyMBParams = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { numId, numTags } = verifyParams(req, this.instance)!;
      req.id = numId;
      req.tags = numTags;
      next();
    } catch (error) {
      next(error);
    }
  };

  public verifyMBPayload = (req: Request, res: Response, next: NextFunction): void => {
    const { data } = req.body;
    try {
      if (!(Array.isArray(data) && data.every((index) => Array.isArray(index) && index.every((item) => typeof item === 'number'))))
        throw new BadRequestError('Wrong data payload');
      req.tags.forEach((tag, i) => {
        if (data[i].length !== this.instance.instances[req.id - 1].instance.readBufferConsistent[tag - 1].params.count)
          throw new BadRequestError('Wrong amount of data in payload');
      });
      req.data = data;
      next();
    } catch (error) {
      next(error);
    }
  };

  public read = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data: MB_BeforeFormat[] = this.instance.mb_readFromDevice(req.id, req.tags);
      res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    try {
      this.instance.mb_writeToDevice(req.id, req.tags, req.data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.instance.mb_writeToDeviceSync(req.id, req.tags, req.data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

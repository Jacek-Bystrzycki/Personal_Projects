import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import type { MB_CreateConnections } from '../../plc/mb/create-mb-connection';
import { verifyParams } from './verifyQueryParams';
import type { MB_BeforeFormatRead, MB_AfterFormatRead, MB_BeforeFormatWrite, MB_AfterFormatWrite } from '../../../types/plc/mb/request';
import { mb_formatReadData, mb_formatWriteData } from './mb-formatData';

export class MB_Controller {
  constructor(private readonly instance: MB_CreateConnections) {}

  public verifyMBParams = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idArr, numTags } = verifyParams(req, this.instance)!;
      req.id = idArr;
      req.tags = numTags;
      next();
    } catch (error) {
      next(error);
    }
  };

  public verifyMBPayload = (req: Request, res: Response, next: NextFunction): void => {
    const { data } = req.body;
    try {
      if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
        throw new BadRequestError('Wrong data payload');
      if (req.tags.length !== 1 || req.id.length !== 1) throw new BadRequestError('Cannot write to multiple devices in one request');
      if (req.tags[0].length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
      req.tags[0].forEach((index, i) => {
        if (this.instance.instances[req.id[0] - 1].instance.readBufferConsistent.find((tag) => tag.id === index)?.params.count !== data[i].length)
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
      const data: MB_BeforeFormatRead[] = this.instance.mb_readFromDevice(req.id, req.tags);
      const resp: MB_AfterFormatRead[] = mb_formatReadData(data);
      res.mbTags = resp;
      next();
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const writeTags: MB_BeforeFormatWrite[] = req.tags[0].map((index, i) => {
      return {
        len: this.instance.instances.find((id) => id.id === req.id[0])!.instance.writeBufferConsistent.find((tag) => tag.id === index)!.params.len,
        format: this.instance.instances.find((id) => id.id === req.id[0])!.instance.writeBufferConsistent.find((tag) => tag.id === index)!.format,
        id: this.instance.instances.find((id) => id.id === req.id[0])!.instance.writeBufferConsistent.find((tag) => tag.id === index)!.id,
        data: req.data[i],
      };
    });

    try {
      const data: MB_AfterFormatWrite = mb_formatWriteData(req.id[0], writeTags);
      this.instance.mb_writeToDevice(data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success`, data: req.data });
    } catch (error) {
      next(error);
    }
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      //const respQuery = await this.instance.mb_writeToDeviceSync(req.id, req.tags, req.data);
      // const resp = { ...respQuery, data: req.data };
      // res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

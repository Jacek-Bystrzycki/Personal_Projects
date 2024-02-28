import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { RTU_CreateConnection } from '../../plc/rtu/create-mb-connection';
import { BadRequestError } from '../../../types/server/errors';
import type { MB_BeforeFormatRead, MB_AfterFormatRead, MB_BeforeFormatWrite, MB_AfterFormatWrite } from '../../../types/plc/mb/request';
import { mb_formatReadData, mb_formatWriteData } from './mb-formatData';
import { getDateAsString } from '../../../utils/get-date-as-string';

export class RTU_Controller {
  constructor(private readonly instance: RTU_CreateConnection) {}

  private verifyParams = (req: Request): { idArr: number[]; numTags: number[][] } => {
    const { id } = req.params;
    const { tags } = req.query;

    let idArr: number[] = [];
    if (id) {
      try {
        idArr = JSON.parse(id);
      } catch (error) {
        throw new BadRequestError("'Ids' needs to be an array of numbers");
      }
      if (!Array.isArray(idArr) || !idArr.every((id) => !isNaN(id))) throw new BadRequestError("'Ids' needs to be an array of numbers");
      idArr.forEach((id) => {
        const index: number = this.instance.instances.instance.readBuffer.findIndex((device) => device.uId === id);
        if (index === -1) throw new BadRequestError(`Instance ${id} not exists`);
      });
    } else {
      this.instance.instances.instance.readBuffer.forEach((device) => {
        idArr.push(device.uId);
      });
    }
    //======================
    const queryExists: boolean = Object.keys(req.query).length > 0;
    let numTags: number[][] = [];
    if (queryExists) {
      if (typeof tags !== 'string') throw new BadRequestError("'tags' missing in query");
      try {
        const tempTags = JSON.parse(tags);
        if (!Array.isArray(tempTags) || !tempTags.every((item) => Array.isArray(item)))
          throw new BadRequestError('Tags needs to ba an array of array of numbers');
        numTags = tempTags;
      } catch (error) {
        throw new BadRequestError('Tags needs to ba an array of array of numbers');
      }
      if (numTags.length !== idArr.length) throw new BadRequestError('Wrong amount of tags');
    } else {
      idArr.forEach((id) => {
        const tempTags: number[] = [];
        for (let i = 0; i < this.instance.instances.instance.readBuffer.find((device) => device.uId === id)!.tags.length; i++) {
          tempTags.push(i + 1);
        }
        numTags.push(tempTags);
      });
    }
    //======================
    let wrongTags: number[][] = [];
    numTags.forEach((id, index) => {
      const tempWrongTags: number[] = [];
      const curId = idArr[index];
      id.forEach((tag) => {
        if (typeof this.instance.instances.instance.readBuffer.find((device) => device.uId === curId)?.tags[tag - 1] === 'undefined') tempWrongTags.push(tag);
      });
      wrongTags.push(tempWrongTags);
    });

    if (!wrongTags.every((id) => id.length === 0)) {
      throw new BadRequestError(`Not all tags ${JSON.stringify(wrongTags)} exist in params definitions`);
    }

    return { idArr, numTags };
  };

  public verifyRTUParams = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idArr, numTags } = this.verifyParams(req);
      req.id = idArr;
      req.tags = numTags;
      next();
    } catch (error) {
      next(error);
    }
  };

  public verifyPayload = (req: Request, res: Response, next: NextFunction): void => {
    const { data } = req.body;

    try {
      if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
        throw new BadRequestError('Wrong data payload');
      if (req.tags.length !== 1 || req.id.length !== 1) throw new BadRequestError('Cannot write to multiple devices in one request');
      if (req.tags[0].length !== data.length) throw new BadRequestError(`Wrong amount of data payload`);
      req.tags[0].forEach((index, i) => {
        if (
          this.instance.instances.instance.readBuffer.find((device) => device.uId === req.id[0])?.tags.find((tag) => tag.id === index)?.params.count !==
          data[i].length
        )
          throw new BadRequestError(`Wrong amount of data in at least one of the data payload`);
      });

      req.data = data;
      next();
    } catch (error) {
      next(error);
    }
  };

  private prepareWriteTags = (tags: number[], instanceId: number, data: number[][]): MB_BeforeFormatWrite[] => {
    return tags.map((index, i) => {
      return {
        len: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)!.params.len,
        format: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)!.format,
        id: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)!.id,
        data: data[i],
        bitDataForRead:
          this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)?.format === 'Bit'
            ? this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)?.data
            : undefined,
        startAddForRead:
          this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)!.tags.find((tag) => tag.id === index)?.format === 'Bit'
            ? this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)?.tags.find((tag) => tag.id === index)?.params.start
            : undefined,
      };
    });
  };

  public read = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data: MB_BeforeFormatRead[] = this.instance.rtu_readFromDevice(req.id, req.tags);
      const resp: MB_AfterFormatRead[] = mb_formatReadData(data);
      res.rtuTags = resp;
      next();
    } catch (error) {
      next(error);
    }
  };
  public write = (req: Request, res: Response, next: NextFunction): void => {
    const writeTags: MB_BeforeFormatWrite[] = this.prepareWriteTags(req.tags[0], req.id[0], req.data);

    try {
      const data: MB_AfterFormatWrite = mb_formatWriteData(req.id[0], writeTags);
      this.instance.rtu_writeToDevice(data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success`, data: req.data });
    } catch (error) {
      next(error);
    }
  };
  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const writeTags: MB_BeforeFormatWrite[] = this.prepareWriteTags(req.tags[0], req.id[0], req.data);

    try {
      const data: MB_AfterFormatWrite = mb_formatWriteData(req.id[0], writeTags);
      const respQuery = await this.instance.rtu_writeToDeviceSync(data);
      const resp = { ...respQuery, data: req.data };
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success`, resp });
    } catch (error) {
      next(error);
    }
  };
}

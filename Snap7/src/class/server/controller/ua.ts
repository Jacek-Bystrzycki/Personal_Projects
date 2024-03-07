import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import type { UA_CreateConnections } from '../../plc/ua/create-ua-connection';
import { verifyParams } from './verifyQueryParams';
import { UA_WriteFormat, UA_DataResponseWrite } from '../../../types/plc/ua/request';

export class UA_Controller {
  constructor(private readonly instance: UA_CreateConnections) {}

  public verifyUAParams = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idArr, numTags } = this.verifyParams(req);
      req.id = idArr;
      req.tags = numTags;
      next();
    } catch (error) {
      next(error);
    }
  };

  public verifyUAPayload = (req: Request, res: Response, next: NextFunction): void => {
    const { data } = req.body;
    req.data = data;
    next();
  };

  public read = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.uaTags = this.instance.ua_readFromServer(req.id, req.tags);
      next();
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const writeTags: UA_WriteFormat = this.prepareWriteTags(req.tags[0], req.id[0], req.data);
    this.instance.ua_writeToServer(writeTags);
    res.status(StatusCodes.CREATED).send('OK');
  };

  public writeSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {};

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
        if (!this.instance.instances[id - 1]) throw new BadRequestError(`Instance ${id} not exists`);
      });
    } else {
      for (let i = 0; i < this.instance.instances.length; i++) idArr.push(i + 1);
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
        for (let i = 0; i < this.instance.instances[id - 1].instance.readBuffer.length; i++) {
          tempTags.push(i + 1);
        }
        numTags.push(tempTags);
      });
    }

    //======================
    let wrongTags: number[][] = [];
    numTags.forEach((id, index) => {
      const tempWrongTags: number[] = [];
      const curId = idArr[index] - 1;
      id.forEach((tag) => {
        if (typeof this.instance.instances[curId].instance.readBuffer[tag - 1] === 'undefined') {
          tempWrongTags.push(tag);
        }
      });
      wrongTags.push(tempWrongTags);
    });

    if (!wrongTags.every((id) => id.length === 0)) {
      throw new BadRequestError(`Not all tags ${JSON.stringify(wrongTags)} exist in params definitions`);
    }

    return { idArr, numTags };
  };

  private prepareWriteTags = (tags: number[], instanceId: number, data: number[][]): UA_WriteFormat => {
    const writeTags: UA_DataResponseWrite[] = tags.map((index, i): UA_DataResponseWrite => {
      return {
        data: data[i],
        tagId: this.instance.instances.find((id) => id.id === instanceId)!.instance.writeBuffer.find((tag) => tag.id === index)!.id,
      };
    });
    return { instanceId, writeTags };
  };
}

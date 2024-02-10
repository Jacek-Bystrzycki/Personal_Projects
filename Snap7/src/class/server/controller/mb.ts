import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { CustomServer } from '../custom-server';

export class MB_Controller {
  constructor(private readonly instance: CustomServer) {}
  public read = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { indexes } = req.query;
    try {
      if (typeof indexes === 'string' && Array.isArray(JSON.parse(indexes))) {
        const params: number[] = JSON.parse(indexes);
        const numId = parseInt(id, 10);
        const data = this.instance.devices.mb_definitions?.mb_readFromDevice(numId, params);
        res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
      } else throw new BadRequestError('Wrong registers');
    } catch (error) {
      next(error);
    }
  };

  public write = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { indexes } = req.query;
    const { data } = req.body;

    try {
      if (typeof indexes !== 'string') throw new BadRequestError('No indexes supplied');
      const recvIndexes: number[] = JSON.parse(indexes);
      if (!(Array.isArray(recvIndexes) && recvIndexes.every((index) => typeof index === 'number'))) throw new BadRequestError('Wrong indexes');
      if (!(Array.isArray(data) && data.every((index) => Array.isArray(index) && index.every((item) => typeof item === 'number'))))
        throw new BadRequestError('Wrong data payload');
      const numId = parseInt(id, 10);
      this.instance.devices.mb_definitions?.mb_writeToDevice(numId, recvIndexes, data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import { BadRequestError } from '../../../types/server/errors';
import { CustomServer } from '../custom-server';

export class MB_Controller {
  constructor(private readonly instance: CustomServer) {}
  public read = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { registers } = req.query;
    try {
      if (typeof registers !== 'string') throw new BadRequestError('Wrong registers');
      const numId = parseInt(id, 10);
      const data = await this.instance.devices.mb_definitions?.mb_ReadFromDevice(numId, JSON.parse(registers));
      res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
    } catch (error) {
      next(error);
    }
  };

  public write = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { start } = req.query;
    const { data } = req.body;
    try {
      if (typeof start !== 'string') throw new BadRequestError('Wrong start register');
      if (!(Array.isArray(data) && data.every((index) => typeof index === 'number'))) throw new BadRequestError('Wrong data payload');
      const numId = parseInt(id, 10);
      const numStart = parseInt(start, 10);
      await this.instance.devices.mb_definitions?.mb_WriteToDevice(numId, numStart, data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Created` });
    } catch (error) {
      next(error);
    }
  };
}

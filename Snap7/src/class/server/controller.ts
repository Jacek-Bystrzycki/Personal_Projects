import { s7_plc, mb_devices } from '../..';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../utils/get-date-as-string';
import { BadRequestError } from '../../types/server/errors';

export class S7_Controller {
  public read = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { indexes } = req.query;
    try {
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
      {
        const numId = parseInt(id, 10);
        const resp = await s7_plc.s7_readData(numId, JSON.parse(indexes));
        const data = resp.map((item) => [...item.Data]);
        res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
      }
    } catch (error) {
      next(error);
    }
  };

  public write = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { indexes } = req.query;
    const { data } = req.body;

    try {
      if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number'))))
        throw new BadRequestError('Wrong data payload');
      if (typeof indexes !== 'string') throw new BadRequestError('Wrong indexes');
      {
        const numId = parseInt(id, 10);
        const buffers: Buffer[] = data.map((buffer) => Buffer.from(buffer));
        await s7_plc.s7_writeData(numId, JSON.parse(indexes), buffers);
        res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Created` });
      }
    } catch (error) {
      next(error);
    }
  };
}

export class MB_Controller {
  public read = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { registers } = req.query;
    try {
      if (typeof registers !== 'string') throw new BadRequestError('Wrong registers');
      const numId = parseInt(id, 10);
      const data = await mb_devices.mb_ReadFromDevice(numId, JSON.parse(registers));
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
      await mb_devices.mb_WriteToDevice(numId, numStart, data);
      res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Created` });
    } catch (error) {
      next(error);
    }
  };
}

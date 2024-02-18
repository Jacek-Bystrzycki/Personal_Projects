import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import type { S7_AfterFormatRead } from '../../../types/plc/s7/request';
import type { MB_AfterFormatRead } from '../../../types/plc/mb/request';

type CustomResponse = (S7_AfterFormatRead | MB_AfterFormatRead)[];

export const sendResponse = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let resp: CustomResponse = [];
    if (res.s7Tags) {
      resp = [...resp, ...res.s7Tags];
    }
    if (res.mbTags) {
      resp = [...resp, ...res.s7Tags];
    }
    res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, amount: resp.length, response: resp });
  } catch (error) {
    next(error);
  }
};

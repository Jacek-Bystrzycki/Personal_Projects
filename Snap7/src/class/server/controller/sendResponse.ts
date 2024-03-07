import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDateAsString } from '../../../utils/get-date-as-string';
import type { S7_AfterFormatRead } from '../../../types/plc/s7/request';
import type { MB_AfterFormatRead } from '../../../types/plc/mb/request';
import type { UA_ReadFormat } from '../../../types/plc/ua/request';

type CustomResponse = (S7_AfterFormatRead | MB_AfterFormatRead | UA_ReadFormat)[];

export const sendResponse = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let resp: CustomResponse = [];
    if (res.s7Tags) {
      resp = [...resp, ...res.s7Tags];
    }
    if (res.mbTags) {
      resp = [...resp, ...res.mbTags];
    }
    if (res.rtuTags) {
      resp = [...resp, ...res.rtuTags];
    }
    if (res.uaTags) {
      resp = [...resp, ...res.uaTags];
    }
    res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, amount: resp.length, response: resp });
  } catch (error) {
    next(error);
  }
};

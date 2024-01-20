import { BadRequestError, InternalError, NotFoundError, CustomError } from '../../types/server/errors';
import { Request, Response, NextFunction } from 'express';
import { getDateAsString } from '../../utils/get-date-as-string';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Resource not found on Server: ${req.port}`));
};

export class ErrorHandler {
  static errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof BadRequestError) {
      res.status(BadRequestError.statusCode).json({ message: `${getDateAsString()}${error}` });
    } else if (error instanceof InternalError) {
      res.status(InternalError.statusCode).json({ message: `${getDateAsString()}${error}` });
    } else if (error instanceof NotFoundError) {
      res.status(NotFoundError.statusCode).json({ message: `${getDateAsString()}${error}` });
    } else {
      res.status(InternalError.statusCode).json({ message: `${getDateAsString()}${error}` });
    }
  };
}

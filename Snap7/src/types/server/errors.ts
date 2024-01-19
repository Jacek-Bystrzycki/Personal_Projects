import { StatusCodes } from 'http-status-codes';

export class CustomError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class BadRequestError extends CustomError {
  static statusCode: number = StatusCodes.BAD_REQUEST;
  constructor(public readonly message: string) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  static statusCode: number = StatusCodes.NOT_FOUND;
  constructor(public readonly message: string) {
    super(message);
  }
}

export class InternalError extends CustomError {
  static statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  constructor(public readonly message: string) {
    super(message);
  }
}

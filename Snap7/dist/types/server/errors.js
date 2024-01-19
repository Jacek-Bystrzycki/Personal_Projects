"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.NotFoundError = exports.BadRequestError = exports.CustomError = void 0;
const http_status_codes_1 = require("http-status-codes");
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
BadRequestError.statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.NotFoundError = NotFoundError;
NotFoundError.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
class InternalError extends CustomError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.InternalError = InternalError;
InternalError.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;

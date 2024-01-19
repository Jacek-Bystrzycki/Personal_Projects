"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.notFound = void 0;
const errors_1 = require("../../types/server/errors");
const get_date_as_string_1 = require("../../utils/get-date-as-string");
const notFound = (req, res, next) => {
    next(new errors_1.NotFoundError('Resource not found'));
};
exports.notFound = notFound;
class ErrorHandler {
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.errorHandler = (error, req, res, next) => {
    if (error instanceof errors_1.BadRequestError) {
        res.status(errors_1.BadRequestError.statusCode).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}${error}` });
    }
    else if (error instanceof errors_1.InternalError) {
        res.status(errors_1.InternalError.statusCode).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}${error}` });
    }
    else if (error instanceof errors_1.NotFoundError) {
        res.status(errors_1.NotFoundError.statusCode).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}${error}` });
    }
    else {
        res.status(errors_1.InternalError.statusCode).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}${error}` });
    }
};

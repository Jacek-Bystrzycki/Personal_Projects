"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MB_Controller = void 0;
const http_status_codes_1 = require("http-status-codes");
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
const errors_1 = require("../../../types/server/errors");
class MB_Controller {
    constructor(instance) {
        this.instance = instance;
        this.read = (req, res, next) => {
            var _a;
            const { id } = req.params;
            const { indexes } = req.query;
            try {
                if (typeof indexes === 'string' && Array.isArray(JSON.parse(indexes))) {
                    const params = JSON.parse(indexes);
                    const numId = parseInt(id, 10);
                    const data = (_a = this.instance.devices.mb_definitions) === null || _a === void 0 ? void 0 : _a.mb_readFromDevice(numId, params);
                    res.status(http_status_codes_1.StatusCodes.OK).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, data });
                }
                else
                    throw new errors_1.BadRequestError('Wrong registers');
            }
            catch (error) {
                next(error);
            }
        };
        this.write = (req, res, next) => {
            var _a;
            const { id } = req.params;
            const { indexes } = req.query;
            const { data } = req.body;
            try {
                if (typeof indexes !== 'string')
                    throw new errors_1.BadRequestError('No indexes supplied');
                const recvIndexes = JSON.parse(indexes);
                if (!(Array.isArray(recvIndexes) && recvIndexes.every((index) => typeof index === 'number')))
                    throw new errors_1.BadRequestError('Wrong indexes');
                if (!(Array.isArray(data) && data.every((index) => Array.isArray(index) && index.every((item) => typeof item === 'number'))))
                    throw new errors_1.BadRequestError('Wrong data payload');
                const numId = parseInt(id, 10);
                (_a = this.instance.devices.mb_definitions) === null || _a === void 0 ? void 0 : _a.mb_writeToDevice(numId, recvIndexes, data);
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success` });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MB_Controller = MB_Controller;

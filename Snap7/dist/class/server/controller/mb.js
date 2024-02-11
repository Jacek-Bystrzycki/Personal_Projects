"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MB_Controller = void 0;
const http_status_codes_1 = require("http-status-codes");
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
const errors_1 = require("../../../types/server/errors");
class MB_Controller {
    constructor(instance) {
        this.instance = instance;
        this.read = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { registers } = req.query;
            try {
                if (typeof registers !== 'string')
                    throw new errors_1.BadRequestError('Wrong registers');
                const numId = parseInt(id, 10);
                const data = yield ((_a = this.instance.devices.mb_definitions) === null || _a === void 0 ? void 0 : _a.mb_ReadFromDevice(numId, JSON.parse(registers)));
                res.status(http_status_codes_1.StatusCodes.OK).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, data });
            }
            catch (error) {
                next(error);
            }
        });
        this.write = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const { id } = req.params;
            const { start } = req.query;
            const { data } = req.body;
            try {
                if (typeof start !== 'string')
                    throw new errors_1.BadRequestError('Wrong start register');
                if (!(Array.isArray(data) && data.every((index) => typeof index === 'number')))
                    throw new errors_1.BadRequestError('Wrong data payload');
                const numId = parseInt(id, 10);
                const numStart = parseInt(start, 10);
                yield ((_b = this.instance.devices.mb_definitions) === null || _b === void 0 ? void 0 : _b.mb_WriteToDevice(numId, numStart, data));
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Created` });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.MB_Controller = MB_Controller;

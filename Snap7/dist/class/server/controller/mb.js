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
const errors_1 = require("../../../types/server/errors");
const verifyQueryParams_1 = require("./verifyQueryParams");
const mb_formatData_1 = require("./mb-formatData");
class MB_Controller {
    constructor(instance) {
        this.instance = instance;
        this.verifyMBParams = (req, res, next) => {
            try {
                const { idArr, numTags } = (0, verifyQueryParams_1.verifyParams)(req, this.instance);
                req.id = idArr;
                req.tags = numTags;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyMBPayload = (req, res, next) => {
            const { data } = req.body;
            try {
                if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
                    throw new errors_1.BadRequestError('Wrong data payload');
                if (req.tags.length !== 1 || req.id.length !== 1)
                    throw new errors_1.BadRequestError('Cannot write to multiple devices in one request');
                if (req.tags[0].length !== data.length)
                    throw new errors_1.BadRequestError(`Wrong amount of data payload`);
                req.tags[0].forEach((index, i) => {
                    var _a;
                    if (((_a = this.instance.instances[req.id[0] - 1].instance.readBufferConsistent.find((tag) => tag.id === index)) === null || _a === void 0 ? void 0 : _a.params.count) !== data[i].length)
                        throw new errors_1.BadRequestError(`Wrong amount of data in at least one of the data payload`);
                });
                req.data = data;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.read = (req, res, next) => {
            try {
                const data = this.instance.mb_readFromDevice(req.id, req.tags);
                const resp = (0, mb_formatData_1.mb_formatReadData)(data);
                res.mbTags = resp;
                next();
                // res.status(StatusCodes.OK).json({ message: `${getDateAsString()}Success`, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.write = (req, res, next) => {
            try {
                // this.instance.mb_writeToDevice(req.id, req.tags, req.data);
                // res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
            }
            catch (error) {
                next(error);
            }
        };
        this.writeSync = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // await this.instance.mb_writeToDeviceSync(req.id, req.tags, req.data);
                // res.status(StatusCodes.CREATED).json({ message: `${getDateAsString()}Success` });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.MB_Controller = MB_Controller;

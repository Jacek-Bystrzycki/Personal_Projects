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
exports.S7_Controller = void 0;
const http_status_codes_1 = require("http-status-codes");
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
const errors_1 = require("../../../types/server/errors");
const verifyQueryParams_1 = require("./verifyQueryParams");
const s7_formatData_1 = require("./s7-formatData");
class S7_Controller {
    constructor(instance) {
        this.instance = instance;
        this.verifyS7Params = (req, res, next) => {
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
        this.verifyS7Payload = (req, res, next) => {
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
                    if (((_a = this.instance.instances[req.id[0] - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)) === null || _a === void 0 ? void 0 : _a.params.Amount) !== data[i].length)
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
                const data = this.instance.s7_readData(req.id, req.tags);
                const response = (0, s7_formatData_1.s7_formatReadData)(data);
                res.s7Tags = response;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.prepareWriteTags = (tags, instanceId, data) => {
            return tags.map((index, i) => {
                return {
                    type: this.instance.instances.find((id) => id.id === instanceId).instance.writeBufferConsistent.find((tag) => tag.id === index).params.WordLen,
                    format: this.instance.instances.find((id) => id.id === instanceId).instance.writeBufferConsistent.find((tag) => tag.id === index).format,
                    id: this.instance.instances.find((id) => id.id === instanceId).instance.writeBufferConsistent.find((tag) => tag.id === index).id,
                    data: data[i],
                };
            });
        };
        this.write = (req, res, next) => {
            const writeTags = this.prepareWriteTags(req.tags[0], req.id[0], req.data);
            try {
                const data = (0, s7_formatData_1.s7_formatWriteData)(req.id[0], writeTags);
                this.instance.s7_writeData(data);
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, values: req.data });
            }
            catch (error) {
                next(error);
            }
        };
        this.writeSync = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const writeTags = this.prepareWriteTags(req.tags[0], req.id[0], req.data);
            try {
                const data = (0, s7_formatData_1.s7_formatWriteData)(req.id[0], writeTags);
                const respQuery = yield this.instance.s7_writeDataSync(data);
                const resp = Object.assign(Object.assign({}, respQuery), { values: req.data });
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, resp });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.S7_Controller = S7_Controller;

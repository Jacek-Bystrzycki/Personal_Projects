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
exports.RTU_Controller = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../../../types/server/errors");
const mb_formatData_1 = require("./mb-formatData");
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
class RTU_Controller {
    constructor(instance) {
        this.instance = instance;
        this.verifyParams = (req) => {
            const { id } = req.params;
            const { tags } = req.query;
            let idArr = [];
            if (id) {
                try {
                    idArr = JSON.parse(id);
                }
                catch (error) {
                    throw new errors_1.BadRequestError("'Ids' needs to be an array of numbers");
                }
                if (!Array.isArray(idArr) || !idArr.every((id) => !isNaN(id)))
                    throw new errors_1.BadRequestError("'Ids' needs to be an array of numbers");
                idArr.forEach((id) => {
                    const index = this.instance.instances.instance.readBuffer.findIndex((device) => device.uId === id);
                    if (index === -1)
                        throw new errors_1.BadRequestError(`Instance ${id} not exists`);
                });
            }
            else {
                this.instance.instances.instance.readBuffer.forEach((device) => {
                    idArr.push(device.uId);
                });
            }
            //======================
            const queryExists = Object.keys(req.query).length > 0;
            let numTags = [];
            if (queryExists) {
                if (typeof tags !== 'string')
                    throw new errors_1.BadRequestError("'tags' missing in query");
                try {
                    const tempTags = JSON.parse(tags);
                    if (!Array.isArray(tempTags) || !tempTags.every((item) => Array.isArray(item)))
                        throw new errors_1.BadRequestError('Tags needs to ba an array of array of numbers');
                    numTags = tempTags;
                }
                catch (error) {
                    throw new errors_1.BadRequestError('Tags needs to ba an array of array of numbers');
                }
                if (numTags.length !== idArr.length)
                    throw new errors_1.BadRequestError('Wrong amount of tags');
            }
            else {
                idArr.forEach((id) => {
                    const tempTags = [];
                    for (let i = 0; i < this.instance.instances.instance.readBuffer.find((device) => device.uId === id).tags.length; i++) {
                        tempTags.push(i + 1);
                    }
                    numTags.push(tempTags);
                });
            }
            //======================
            let wrongTags = [];
            numTags.forEach((id, index) => {
                const tempWrongTags = [];
                const curId = idArr[index];
                id.forEach((tag) => {
                    var _a;
                    if (typeof ((_a = this.instance.instances.instance.readBuffer.find((device) => device.uId === curId)) === null || _a === void 0 ? void 0 : _a.tags[tag - 1]) === 'undefined')
                        tempWrongTags.push(tag);
                });
                wrongTags.push(tempWrongTags);
            });
            if (!wrongTags.every((id) => id.length === 0)) {
                throw new errors_1.BadRequestError(`Not all tags ${JSON.stringify(wrongTags)} exist in params definitions`);
            }
            return { idArr, numTags };
        };
        this.verifyRTUParams = (req, res, next) => {
            try {
                const { idArr, numTags } = this.verifyParams(req);
                req.id = idArr;
                req.tags = numTags;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyPayload = (req, res, next) => {
            const { data } = req.body;
            try {
                if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
                    throw new errors_1.BadRequestError('Wrong data payload');
                if (req.tags.length !== 1 || req.id.length !== 1)
                    throw new errors_1.BadRequestError('Cannot write to multiple devices in one request');
                if (req.tags[0].length !== data.length)
                    throw new errors_1.BadRequestError(`Wrong amount of data payload`);
                req.tags[0].forEach((index, i) => {
                    var _a, _b;
                    if (((_b = (_a = this.instance.instances.instance.readBuffer.find((device) => device.uId === req.id[0])) === null || _a === void 0 ? void 0 : _a.tags.find((tag) => tag.id === index)) === null || _b === void 0 ? void 0 : _b.params.count) !==
                        data[i].length)
                        throw new errors_1.BadRequestError(`Wrong amount of data in at least one of the data payload`);
                });
                req.data = data;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.prepareWriteTags = (tags, instanceId, data) => {
            return tags.map((index, i) => {
                var _a, _b, _c, _d, _e;
                return {
                    len: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index).params.len,
                    format: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index).format,
                    id: this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index).id,
                    data: data[i],
                    bitDataForRead: ((_a = this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index)) === null || _a === void 0 ? void 0 : _a.format) === 'Bit'
                        ? (_b = this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index)) === null || _b === void 0 ? void 0 : _b.data
                        : undefined,
                    startAddForRead: ((_c = this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId).tags.find((tag) => tag.id === index)) === null || _c === void 0 ? void 0 : _c.format) === 'Bit'
                        ? (_e = (_d = this.instance.instances.instance.readBuffer.find((id) => id.uId === instanceId)) === null || _d === void 0 ? void 0 : _d.tags.find((tag) => tag.id === index)) === null || _e === void 0 ? void 0 : _e.params.start
                        : undefined,
                };
            });
        };
        this.read = (req, res, next) => {
            try {
                const data = this.instance.rtu_readFromDevice(req.id, req.tags);
                const resp = (0, mb_formatData_1.mb_formatReadData)(data);
                res.rtuTags = resp;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.write = (req, res, next) => {
            const writeTags = this.prepareWriteTags(req.tags[0], req.id[0], req.data);
            try {
                const data = (0, mb_formatData_1.mb_formatWriteData)(req.id[0], writeTags);
                this.instance.rtu_writeToDevice(data);
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, values: req.data });
            }
            catch (error) {
                next(error);
            }
        };
        this.writeSync = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const writeTags = this.prepareWriteTags(req.tags[0], req.id[0], req.data);
            try {
                const data = (0, mb_formatData_1.mb_formatWriteData)(req.id[0], writeTags);
                const respQuery = yield this.instance.rtu_writeToDeviceSync(data);
                const resp = Object.assign(Object.assign({}, respQuery), { values: req.data });
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, resp });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.RTU_Controller = RTU_Controller;

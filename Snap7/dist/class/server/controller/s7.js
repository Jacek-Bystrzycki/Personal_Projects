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
const buffer_to_data_1 = require("../../../utils/plc/s7/buffer-to-data");
const data_to_buffer_1 = require("../../../utils/plc/s7/data-to-buffer");
class S7_Controller {
    constructor(instance) {
        this.instance = instance;
        this.read = (req, res, next) => {
            var _a, _b, _c;
            const { id } = req.params;
            const { tags } = req.query;
            const queryExists = Object.keys(req.query).length > 0;
            try {
                const numId = parseInt(id, 10);
                if (!((_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1]))
                    throw new errors_1.BadRequestError(`Instance ${id} not exists`);
                const allIndexes = (_b = this.instance.devices.s7_definitions) === null || _b === void 0 ? void 0 : _b.instances[numId - 1].instance.readBufferConsistent.map((tag) => tag.id);
                const indexes = queryExists ? tags : JSON.stringify(allIndexes);
                if (typeof indexes !== 'string')
                    throw new errors_1.BadRequestError('Wrong tags');
                const indexesNumber = JSON.parse(indexes);
                if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')))
                    throw new errors_1.BadRequestError('Tag must be a number');
                indexesNumber.forEach((index) => {
                    var _a;
                    if (((_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.writeBufferConsistent.findIndex((tag) => tag.id === index)) === -1)
                        throw new errors_1.BadRequestError(`Not all tags [${index}] exist in params definitions`);
                });
                const resp = (_c = this.instance.devices.s7_definitions) === null || _c === void 0 ? void 0 : _c.s7_readData(numId, indexesNumber);
                const data = readData(this.instance, resp, numId, indexesNumber);
                res.status(http_status_codes_1.StatusCodes.OK).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.write = (req, res, next) => {
            var _a;
            const { id } = req.params;
            const { tags } = req.query;
            const indexes = tags;
            const { data } = req.body;
            try {
                const { numId, indexesNumber, buffers } = writeData(this.instance, id, indexes, data);
                (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.s7_writeData(numId, indexesNumber, buffers);
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success` });
            }
            catch (error) {
                next(error);
            }
        };
        this.writeSync = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { tags } = req.query;
            const indexes = tags;
            const { data } = req.body;
            try {
                const { numId, indexesNumber, buffers } = writeData(this.instance, id, indexes, data);
                yield ((_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.s7_writeDataSync(numId, indexesNumber, buffers));
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success` });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.S7_Controller = S7_Controller;
//=============================================================================
const readData = (context, resp, numId, indexesNumber) => {
    if (resp) {
        const data = [];
        const readTags = indexesNumber.map((index) => {
            var _a, _b, _c, _d, _e, _f;
            return {
                type: (_b = (_a = context.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)) === null || _b === void 0 ? void 0 : _b.params.WordLen,
                format: (_d = (_c = context.devices.s7_definitions) === null || _c === void 0 ? void 0 : _c.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)) === null || _d === void 0 ? void 0 : _d.format,
                id: (_f = (_e = context.devices.s7_definitions) === null || _e === void 0 ? void 0 : _e.instances[numId - 1].instance.readBufferConsistent.find((tag) => tag.id === index)) === null || _f === void 0 ? void 0 : _f.id,
            };
        });
        readTags.forEach((tag) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            switch (tag.type) {
                case 1 /* snap7.WordLen.S7WLBit */:
                    if (tag.format === 'Bit') {
                        const singleData = { values: [...(_a = resp.find((resp) => resp.id === tag.id)) === null || _a === void 0 ? void 0 : _a.data] };
                        data.push(singleData);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 2 /* snap7.WordLen.S7WLByte */:
                    if (tag.format === 'Byte_As_BitArray') {
                        const singleData = { values: (0, buffer_to_data_1.bufferByteToBitArray)((_b = resp.find((resp) => resp.id === tag.id)) === null || _b === void 0 ? void 0 : _b.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Byte_As_Int') {
                        const singleData = { values: (0, buffer_to_data_1.bufferByteToInt)((_c = resp.find((resp) => resp.id === tag.id)) === null || _c === void 0 ? void 0 : _c.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Byte_As_Uint') {
                        const singleData = { values: (0, buffer_to_data_1.bufferByteToUInt)((_d = resp.find((resp) => resp.id === tag.id)) === null || _d === void 0 ? void 0 : _d.data) };
                        data.push(singleData);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 4 /* snap7.WordLen.S7WLWord */:
                    if (tag.format === 'Word_As_BitArray') {
                        const singleData = { values: (0, buffer_to_data_1.bufferWordToBitArray)((_e = resp.find((resp) => resp.id === tag.id)) === null || _e === void 0 ? void 0 : _e.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        const singleData = { values: (0, buffer_to_data_1.bufferWordToInt)((_f = resp.find((resp) => resp.id === tag.id)) === null || _f === void 0 ? void 0 : _f.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        const singleData = { values: (0, buffer_to_data_1.bufferWordToUInt)((_g = resp.find((resp) => resp.id === tag.id)) === null || _g === void 0 ? void 0 : _g.data) };
                        data.push(singleData);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 6 /* snap7.WordLen.S7WLDWord */:
                    if (tag.format === 'Dword_As_BitArray') {
                        const singleData = { values: (0, buffer_to_data_1.bufferDWordToBitArray)((_h = resp.find((resp) => resp.id === tag.id)) === null || _h === void 0 ? void 0 : _h.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Dword_As_Int') {
                        const singleData = { values: (0, buffer_to_data_1.bufferDwordToInt)((_j = resp.find((resp) => resp.id === tag.id)) === null || _j === void 0 ? void 0 : _j.data) };
                        data.push(singleData);
                        break;
                    }
                    if (tag.format === 'Dword_As_Uint') {
                        const singleData = { values: (0, buffer_to_data_1.bufferDwordToUInt)((_k = resp.find((resp) => resp.id === tag.id)) === null || _k === void 0 ? void 0 : _k.data) };
                        data.push(singleData);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 8 /* snap7.WordLen.S7WLReal */:
                    if (tag.format === 'Real') {
                        const singleData = { values: (0, buffer_to_data_1.bufferRealToFloat)((_l = resp.find((resp) => resp.id === tag.id)) === null || _l === void 0 ? void 0 : _l.data) };
                        data.push(singleData);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                default:
                    throw new errors_1.BadRequestError('Unsupported data type');
            }
        });
        const dataResponse = data.map((singleData, index) => {
            return {
                isError: resp[index].isError,
                status: resp[index].status,
                id: resp[index].id,
                values: singleData.values,
            };
        });
        return dataResponse;
    }
    else
        throw new errors_1.BadRequestError('Empty data');
};
const writeData = (context, id, indexes, data) => {
    var _a;
    if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
        throw new errors_1.BadRequestError('Wrong data payload');
    if (typeof indexes !== 'string')
        throw new errors_1.BadRequestError('Wrong tags');
    const numId = parseInt(id, 10);
    const indexesNumber = JSON.parse(indexes);
    const buffers = [];
    if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')))
        throw new errors_1.BadRequestError('Wrong tags');
    if (!((_a = context.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1]))
        throw new errors_1.BadRequestError(`Instance ${numId} not exists`);
    const writeTags = indexesNumber.map((index, i) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (((_a = context.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.writeBufferConsistent.findIndex((tag) => tag.id === index)) === -1)
            throw new errors_1.BadRequestError(`Not all tags [${index}] exist in params definitions`);
        if (((_c = (_b = context.devices.s7_definitions) === null || _b === void 0 ? void 0 : _b.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)) === null || _c === void 0 ? void 0 : _c.params.Amount) !== data[i].length)
            throw new errors_1.BadRequestError(`Wrong amount of data in at least one of the data payload`);
        if (indexesNumber.length !== data.length)
            throw new errors_1.BadRequestError(`Wrong amount of data payload`);
        return {
            type: (_e = (_d = context.devices.s7_definitions) === null || _d === void 0 ? void 0 : _d.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)) === null || _e === void 0 ? void 0 : _e.params.WordLen,
            format: (_g = (_f = context.devices.s7_definitions) === null || _f === void 0 ? void 0 : _f.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)) === null || _g === void 0 ? void 0 : _g.format,
            id: (_j = (_h = context.devices.s7_definitions) === null || _h === void 0 ? void 0 : _h.instances[numId - 1].instance.writeBufferConsistent.find((tag) => tag.id === index)) === null || _j === void 0 ? void 0 : _j.id,
            index: i,
        };
    });
    writeTags.forEach((tag) => {
        switch (tag.type) {
            case 1 /* snap7.WordLen.S7WLBit */:
                if (tag.format === 'Bit') {
                    buffers.push((0, data_to_buffer_1.bitToBuffer)(data[tag.index]));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 2 /* snap7.WordLen.S7WLByte */:
                if (tag.format === 'Byte_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit8ArrayToBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Byte_As_Int') {
                    buffers.push((0, data_to_buffer_1.byteToIntBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Byte_As_Uint') {
                    buffers.push((0, data_to_buffer_1.byteToUIntBuffer)(data[tag.index]));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 4 /* snap7.WordLen.S7WLWord */:
                if (tag.format === 'Word_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit16ArrayToBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Word_As_Int') {
                    buffers.push((0, data_to_buffer_1.wordToIntBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Word_As_Uint') {
                    buffers.push((0, data_to_buffer_1.wordToUIntBuffer)(data[tag.index]));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 6 /* snap7.WordLen.S7WLDWord */:
                if (tag.format === 'Dword_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit32ArrayToBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Dword_As_Int') {
                    buffers.push((0, data_to_buffer_1.dwordToIntBuffer)(data[tag.index]));
                    break;
                }
                if (tag.format === 'Dword_As_Uint') {
                    buffers.push((0, data_to_buffer_1.dwordToUIntBuffer)(data[tag.index]));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 8 /* snap7.WordLen.S7WLReal */:
                if (tag.format === 'Real') {
                    buffers.push((0, data_to_buffer_1.floatToRealBuffer)(data[tag.index]));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            default:
                throw new errors_1.BadRequestError('Unsupported data type');
        }
    });
    return { numId, indexesNumber, buffers };
};

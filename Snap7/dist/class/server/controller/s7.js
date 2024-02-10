"use strict";
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
            var _a;
            const { id } = req.params;
            const { indexes } = req.query;
            try {
                if (typeof indexes !== 'string')
                    throw new errors_1.BadRequestError('Wrong indexes');
                const indexesNumber = JSON.parse(indexes);
                if (!(Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')))
                    throw new errors_1.BadRequestError('indexes with formats');
                const numId = parseInt(id, 10);
                const resp = (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.s7_readData(numId, indexesNumber);
                if (resp) {
                    const data = [];
                    const types = indexesNumber.map((index) => {
                        var _a;
                        return (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.readBuffer[index - 1].params.WordLen;
                    });
                    const formats = indexesNumber.map((index) => {
                        var _a;
                        return (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.readBuffer[index - 1].format;
                    });
                    types.forEach((type, index) => {
                        switch (type) {
                            case 2 /* snap7.WordLen.S7WLByte */:
                                if (formats[index] === 'Byte_As_BitArray') {
                                    data.push((0, buffer_to_data_1.bufferByteToBitArray)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Byte_As_Int') {
                                    data.push((0, buffer_to_data_1.bufferByteToInt)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Byte_As_Uint') {
                                    data.push((0, buffer_to_data_1.bufferByteToUInt)(resp[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 4 /* snap7.WordLen.S7WLWord */:
                                if (formats[index] === 'Word_As_BitArray') {
                                    data.push((0, buffer_to_data_1.bufferWordToBitArray)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Word_As_Int') {
                                    data.push((0, buffer_to_data_1.bufferWordToInt)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Word_As_Uint') {
                                    data.push((0, buffer_to_data_1.bufferWordToUInt)(resp[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 6 /* snap7.WordLen.S7WLDWord */:
                                if (formats[index] === 'Dword_As_BitArray') {
                                    data.push((0, buffer_to_data_1.bufferDWordToBitArray)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Dword_As_Int') {
                                    data.push((0, buffer_to_data_1.bufferDwordToInt)(resp[index]));
                                    break;
                                }
                                if (formats[index] === 'Dword_As_Uint') {
                                    data.push((0, buffer_to_data_1.bufferDwordToUInt)(resp[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 8 /* snap7.WordLen.S7WLReal */:
                                if (formats[index] === 'Real') {
                                    data.push((0, buffer_to_data_1.bufferRealToFloat)(resp[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            default:
                                throw new errors_1.BadRequestError('Unsupported data type');
                        }
                    });
                    res.status(http_status_codes_1.StatusCodes.OK).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, data });
                }
                else
                    throw new errors_1.BadRequestError('Empty data');
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
                if (!(Array.isArray(data) && data.every((item) => Array.isArray(item) && item.every((index) => typeof index === 'number' || Array.isArray(index)))))
                    throw new errors_1.BadRequestError('Wrong data payload');
                if (typeof indexes !== 'string')
                    throw new errors_1.BadRequestError('Wrong indexes');
                const numId = parseInt(id, 10);
                const indexesNumber = JSON.parse(indexes);
                const buffers = [];
                if (Array.isArray(indexesNumber) && indexesNumber.every((item) => typeof item === 'number')) {
                    const types = indexesNumber.map((index, i) => {
                        var _a, _b, _c, _d;
                        if (!((_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1]))
                            throw new errors_1.BadRequestError(`Instance ${numId} not exists`);
                        if (!((_b = this.instance.devices.s7_definitions) === null || _b === void 0 ? void 0 : _b.instances[numId - 1].instance.writeBuffer[index - 1]))
                            throw new errors_1.BadRequestError(`Not all indexes [${index}] exist in params definitions`);
                        if (((_c = this.instance.devices.s7_definitions) === null || _c === void 0 ? void 0 : _c.instances[numId - 1].instance.writeBuffer[index - 1].params.Amount) !== data[i].length)
                            throw new errors_1.BadRequestError(`Wrong amount of data in at least one of the data payload`);
                        if (indexesNumber.length !== data.length)
                            throw new errors_1.BadRequestError(`Wrong amount of data payload`);
                        return (_d = this.instance.devices.s7_definitions) === null || _d === void 0 ? void 0 : _d.instances[numId - 1].instance.writeBuffer[index - 1].params.WordLen;
                    });
                    const formats = indexesNumber.map((index) => {
                        var _a;
                        return (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.instances[numId - 1].instance.writeBuffer[index - 1].format;
                    });
                    types.forEach((type, index) => {
                        switch (type) {
                            case 1 /* snap7.WordLen.S7WLBit */:
                                if (formats[index] === 'Bit') {
                                    buffers.push((0, data_to_buffer_1.bitToBuffer)(data[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 2 /* snap7.WordLen.S7WLByte */:
                                if (formats[index] === 'Byte_As_BitArray') {
                                    buffers.push((0, data_to_buffer_1.bit8ArrayToBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Byte_As_Int') {
                                    buffers.push((0, data_to_buffer_1.byteToIntBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Byte_As_Uint') {
                                    buffers.push((0, data_to_buffer_1.byteToUIntBuffer)(data[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 4 /* snap7.WordLen.S7WLWord */:
                                if (formats[index] === 'Word_As_BitArray') {
                                    buffers.push((0, data_to_buffer_1.bit16ArrayToBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Word_As_Int') {
                                    buffers.push((0, data_to_buffer_1.wordToIntBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Word_As_Uint') {
                                    buffers.push((0, data_to_buffer_1.wordToUIntBuffer)(data[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 6 /* snap7.WordLen.S7WLDWord */:
                                if (formats[index] === 'Dword_As_BitArray') {
                                    buffers.push((0, data_to_buffer_1.bit32ArrayToBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Dword_As_Int') {
                                    buffers.push((0, data_to_buffer_1.dwordToIntBuffer)(data[index]));
                                    break;
                                }
                                if (formats[index] === 'Dword_As_Uint') {
                                    buffers.push((0, data_to_buffer_1.dwordToUIntBuffer)(data[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            case 8 /* snap7.WordLen.S7WLReal */:
                                if (formats[index] === 'Real') {
                                    buffers.push((0, data_to_buffer_1.floatToRealBuffer)(data[index]));
                                    break;
                                }
                                throw new errors_1.BadRequestError(`Tag No: ${index + 1} cannot be formatted as ${formats[index]}`);
                            default:
                                throw new errors_1.BadRequestError('Unsupported data type');
                        }
                    });
                    (_a = this.instance.devices.s7_definitions) === null || _a === void 0 ? void 0 : _a.s7_writeData(numId, indexesNumber, buffers);
                    res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success` });
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.S7_Controller = S7_Controller;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s7_formatWriteData = exports.s7_formatReadData = void 0;
const errors_1 = require("../../../types/server/errors");
const buffer_to_data_1 = require("../../../utils/plc/s7/buffer-to-data");
const data_to_buffer_1 = require("../../../utils/plc/s7/data-to-buffer");
const s7_formatReadData = (resp) => {
    if (resp) {
        const readTags = resp.map((tag) => {
            return { isError: tag.isError, status: tag.status, id: tag.id, format: tag.format, address: tag.address, wordLen: tag.wordLen, values: [] };
        });
        readTags.forEach((tag) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            switch (tag.wordLen) {
                case 1 /* snap7.WordLen.S7WLBit */:
                    if (tag.format === 'Bit') {
                        tag.values = [...(_a = resp.find((resp) => resp.id === tag.id)) === null || _a === void 0 ? void 0 : _a.data];
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 2 /* snap7.WordLen.S7WLByte */:
                    if (tag.format === 'Byte_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferByteToBitArray)((_b = resp.find((resp) => resp.id === tag.id)) === null || _b === void 0 ? void 0 : _b.data);
                        break;
                    }
                    if (tag.format === 'Byte_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferByteToInt)((_c = resp.find((resp) => resp.id === tag.id)) === null || _c === void 0 ? void 0 : _c.data);
                        break;
                    }
                    if (tag.format === 'Byte_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferByteToUInt)((_d = resp.find((resp) => resp.id === tag.id)) === null || _d === void 0 ? void 0 : _d.data);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 4 /* snap7.WordLen.S7WLWord */:
                    if (tag.format === 'Word_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferWordToBitArray)((_e = resp.find((resp) => resp.id === tag.id)) === null || _e === void 0 ? void 0 : _e.data);
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferWordToInt)((_f = resp.find((resp) => resp.id === tag.id)) === null || _f === void 0 ? void 0 : _f.data);
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferWordToUInt)((_g = resp.find((resp) => resp.id === tag.id)) === null || _g === void 0 ? void 0 : _g.data);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 6 /* snap7.WordLen.S7WLDWord */:
                    if (tag.format === 'Dword_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferDWordToBitArray)((_h = resp.find((resp) => resp.id === tag.id)) === null || _h === void 0 ? void 0 : _h.data);
                        break;
                    }
                    if (tag.format === 'Dword_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferDwordToInt)((_j = resp.find((resp) => resp.id === tag.id)) === null || _j === void 0 ? void 0 : _j.data);
                        break;
                    }
                    if (tag.format === 'Dword_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferDwordToUInt)((_k = resp.find((resp) => resp.id === tag.id)) === null || _k === void 0 ? void 0 : _k.data);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 8 /* snap7.WordLen.S7WLReal */:
                    if (tag.format === 'Real') {
                        tag.values = (0, buffer_to_data_1.bufferRealToFloat)((_l = resp.find((resp) => resp.id === tag.id)) === null || _l === void 0 ? void 0 : _l.data);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                default:
                    throw new errors_1.BadRequestError('Unsupported data type');
            }
        });
        return readTags;
    }
    else
        throw new errors_1.BadRequestError('Empty data');
};
exports.s7_formatReadData = s7_formatReadData;
const s7_formatWriteData = (id, writeTags, data) => {
    const buffers = [];
    writeTags.forEach((tag) => {
        switch (tag.type) {
            case 1 /* snap7.WordLen.S7WLBit */:
                if (tag.format === 'Bit') {
                    buffers.push((0, data_to_buffer_1.bitToBuffer)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 2 /* snap7.WordLen.S7WLByte */:
                if (tag.format === 'Byte_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit8ArrayToBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Byte_As_Int') {
                    buffers.push((0, data_to_buffer_1.byteToIntBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Byte_As_Uint') {
                    buffers.push((0, data_to_buffer_1.byteToUIntBuffer)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 4 /* snap7.WordLen.S7WLWord */:
                if (tag.format === 'Word_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit16ArrayToBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Word_As_Int') {
                    buffers.push((0, data_to_buffer_1.wordToIntBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Word_As_Uint') {
                    buffers.push((0, data_to_buffer_1.wordToUIntBuffer)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 6 /* snap7.WordLen.S7WLDWord */:
                if (tag.format === 'Dword_As_BitArray') {
                    buffers.push((0, data_to_buffer_1.bit32ArrayToBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Dword_As_Int') {
                    buffers.push((0, data_to_buffer_1.dwordToIntBuffer)(tag.data));
                    break;
                }
                if (tag.format === 'Dword_As_Uint') {
                    buffers.push((0, data_to_buffer_1.dwordToUIntBuffer)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 8 /* snap7.WordLen.S7WLReal */:
                if (tag.format === 'Real') {
                    buffers.push((0, data_to_buffer_1.floatToRealBuffer)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            default:
                throw new errors_1.BadRequestError('Unsupported data type');
        }
    });
    const respTags = buffers.map((data, index) => {
        return { data, tagId: writeTags[index].id };
    });
    const resp = { instanceId: id, writeTags: respTags };
    return resp;
};
exports.s7_formatWriteData = s7_formatWriteData;

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
            var _a;
            const currentTag = (_a = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _a === void 0 ? void 0 : _a.data;
            switch (tag.wordLen) {
                case 1 /* snap7.WordLen.S7WLBit */:
                    if (tag.format === 'Bit') {
                        tag.values = [...currentTag];
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 2 /* snap7.WordLen.S7WLByte */:
                    if (tag.format === 'Byte_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferByteToBitArray)(currentTag);
                        break;
                    }
                    if (tag.format === 'Byte_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferByteToInt)(currentTag);
                        break;
                    }
                    if (tag.format === 'Byte_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferByteToUInt)(currentTag);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 4 /* snap7.WordLen.S7WLWord */:
                    if (tag.format === 'Word_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferWordToBitArray)(currentTag);
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferWordToInt)(currentTag);
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferWordToUInt)(currentTag);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 6 /* snap7.WordLen.S7WLDWord */:
                    if (tag.format === 'Dword_As_BitArray') {
                        tag.values = (0, buffer_to_data_1.bufferDWordToBitArray)(currentTag);
                        break;
                    }
                    if (tag.format === 'Dword_As_Int') {
                        tag.values = (0, buffer_to_data_1.bufferDwordToInt)(currentTag);
                        break;
                    }
                    if (tag.format === 'Dword_As_Uint') {
                        tag.values = (0, buffer_to_data_1.bufferDwordToUInt)(currentTag);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 8 /* snap7.WordLen.S7WLReal */:
                    if (tag.format === 'Real') {
                        tag.values = (0, buffer_to_data_1.bufferRealToFloat)(currentTag);
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
const s7_formatWriteData = (id, writeTags) => {
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

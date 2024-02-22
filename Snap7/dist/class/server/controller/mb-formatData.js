"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_formatWriteData = exports.mb_formatReadData = void 0;
const errors_1 = require("../../../types/server/errors");
const mb_to_data_1 = require("../../../utils/plc/mb/mb-to-data");
const data_to_mb_1 = require("../../../utils/plc/mb/data-to-mb");
const mb_formatReadData = (resp) => {
    if (resp) {
        const readTags = resp.map((tag) => {
            return { isError: tag.isError, status: tag.status, id: tag.id, len: tag.len, format: tag.format, address: tag.address, values: [] };
        });
        readTags.forEach((tag) => {
            var _a, _b;
            const currentTag = (_a = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _a === void 0 ? void 0 : _a.data;
            switch (tag.len) {
                case 'Bit':
                    if (tag.format === 'Bit') {
                        tag.values = (0, mb_to_data_1.mbWordToBit)(currentTag, (_b = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _b === void 0 ? void 0 : _b.address.holdingRegister);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Word':
                    if (tag.format === 'Word_As_BitArray') {
                        tag.values = (0, mb_to_data_1.mbWordToBitArray)(currentTag);
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        tag.values = (0, mb_to_data_1.mbWordToInt)(currentTag);
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        tag.values = (0, mb_to_data_1.mbWordToUint)(currentTag);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Dword':
                    if (tag.format === 'Float') {
                        tag.values = (0, mb_to_data_1.mbDwordToFloat)(currentTag);
                        break;
                    }
                    if (tag.format === 'FloatInverted') {
                        tag.values = (0, mb_to_data_1.mbDwordToFloatInverted)(currentTag);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                default:
                    throw new errors_1.BadRequestError('Unsupported data type');
            }
        });
        return readTags;
    }
    else {
        throw new errors_1.BadRequestError('Empty data');
    }
};
exports.mb_formatReadData = mb_formatReadData;
const mb_formatWriteData = (id, writeTags) => {
    const values = [];
    writeTags.forEach((tag) => {
        switch (tag.len) {
            case 'Bit':
                if (tag.format == 'Bit') {
                    const currWord = (0, mb_to_data_1.mbWordToBitArray)(tag.bitDataForRead)[0];
                    const tempArr = (0, data_to_mb_1.mbBitToWordBit)(tag.data, currWord, tag.startAddForRead);
                    values.push((0, data_to_mb_1.mb16bitArrayToWord)(tempArr));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 'Word':
                if (tag.format === 'Word_As_BitArray') {
                    values.push((0, data_to_mb_1.mb16bitArrayToWord)(tag.data));
                    break;
                }
                if (tag.format === 'Word_As_Int') {
                    values.push((0, data_to_mb_1.mbIntToWord)(tag.data));
                    break;
                }
                if (tag.format === 'Word_As_Uint') {
                    values.push((0, data_to_mb_1.mbUintToWord)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            case 'Dword':
                if (tag.format === 'Float') {
                    values.push((0, data_to_mb_1.mbFloatToDword)(tag.data));
                    break;
                }
                if (tag.format === 'FloatInverted') {
                    values.push((0, data_to_mb_1.mbFloatInvertedToDword)(tag.data));
                    break;
                }
                throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
            default:
                throw new errors_1.BadRequestError('Unsupported data type');
        }
    });
    const respTags = values.map((data, index) => {
        return { data, tagId: writeTags[index].id };
    });
    const resp = { instanceId: id, writeTags: respTags };
    return resp;
};
exports.mb_formatWriteData = mb_formatWriteData;

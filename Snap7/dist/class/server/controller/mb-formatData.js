"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_formatReadData = void 0;
const errors_1 = require("../../../types/server/errors");
const mb_to_data_1 = require("../../../utils/plc/mb/mb-to-data");
const mb_formatReadData = (resp) => {
    if (resp) {
        const readTags = resp.map((tag) => {
            return { isError: tag.isError, status: tag.status, id: tag.id, len: tag.len, format: tag.format, address: tag.address, values: [] };
        });
        readTags.forEach((tag) => {
            var _a, _b, _c, _d, _e, _f, _g;
            switch (tag.len) {
                case 'Bit':
                    if (tag.format === 'Bit') {
                        tag.values = (0, mb_to_data_1.mbWordToBit)((_a = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _a === void 0 ? void 0 : _a.data, (_b = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _b === void 0 ? void 0 : _b.address.holdingRegister);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Word':
                    if (tag.format === 'Word_As_BitArray') {
                        tag.values = (0, mb_to_data_1.mbWordToBitArray)((_c = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _c === void 0 ? void 0 : _c.data);
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        tag.values = (0, mb_to_data_1.mbWordToInt)((_d = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _d === void 0 ? void 0 : _d.data);
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        tag.values = (0, mb_to_data_1.mbWordToUint)((_e = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _e === void 0 ? void 0 : _e.data);
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Dword':
                    if (tag.format === 'Float') {
                        tag.values = (0, mb_to_data_1.mbDwordToFloat)((_f = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _f === void 0 ? void 0 : _f.data);
                        break;
                    }
                    if (tag.format === 'FloatInverted') {
                        tag.values = (0, mb_to_data_1.mbDwordToFloatInverted)((_g = resp.find((resp) => resp.id === tag.id && resp.address.deviceId === tag.address.deviceId)) === null || _g === void 0 ? void 0 : _g.data);
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

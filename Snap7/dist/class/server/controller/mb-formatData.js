"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb_formatReadData = void 0;
const errors_1 = require("../../../types/server/errors");
const mb_formatReadData = (resp) => {
    if (resp) {
        const readTags = resp.map((tag) => {
            return { isError: tag.isError, status: tag.status, id: tag.id, len: tag.len, format: tag.format, address: tag.address, values: [] };
        });
        readTags.forEach((tag) => {
            switch (tag.len) {
                case 'Bit':
                    if (tag.format === 'Bit') {
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Word':
                    if (tag.format === 'Word_As_BitArray') {
                        break;
                    }
                    if (tag.format === 'Word_As_Int') {
                        break;
                    }
                    if (tag.format === 'Word_As_Uint') {
                        break;
                    }
                    throw new errors_1.BadRequestError(`Tag No: ${tag.id} cannot be formatted as ${tag.format}`);
                case 'Dword':
                    if (tag.format === 'Float') {
                        break;
                    }
                    if (tag.format === 'FloatInverted') {
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

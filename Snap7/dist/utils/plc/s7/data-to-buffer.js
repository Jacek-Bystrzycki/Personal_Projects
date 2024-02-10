"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatToRealBuffer = exports.dwordToUIntBuffer = exports.dwordToIntBuffer = exports.wordToUIntBuffer = exports.wordToIntBuffer = exports.byteToUIntBuffer = exports.byteToIntBuffer = exports.bit32ArrayToBuffer = exports.bit16ArrayToBuffer = exports.bit8ArrayToBuffer = exports.bitToBuffer = void 0;
//=============== S7 Write utils =================
const errors_1 = require("../../../types/server/errors");
const bitToBuffer = (data) => {
    if (data.length === 1 && (data[0] === 0 || data[0] === 1)) {
        return Buffer.from([data[0]]);
    }
    throw new errors_1.BadRequestError(`Bit needs to be 0 or 1`);
};
exports.bitToBuffer = bitToBuffer;
const bit8ArrayToBuffer = (data) => {
    if (Array.isArray(data) &&
        data.every((item) => {
            return Array.isArray(item) && item.length === 8 && item.every((bit) => bit === 1 || bit === 0);
        })) {
        const bufferArray = [];
        data.forEach((item) => {
            let dec = 0;
            let factor = 1;
            for (let i = 0; i < item.length; i++) {
                if (item[i] === 1) {
                    dec += factor;
                }
                factor *= 2;
            }
            bufferArray.push(Buffer.from([dec]));
        });
        return Buffer.concat(bufferArray);
    }
    else
        throw new errors_1.BadRequestError('Wrong bit sequence in payload');
};
exports.bit8ArrayToBuffer = bit8ArrayToBuffer;
const bit16ArrayToBuffer = (data) => {
    if (Array.isArray(data) &&
        data.every((item) => {
            return Array.isArray(item) && item.length === 16 && item.every((bit) => bit === 1 || bit === 0);
        })) {
        const bufferArray = [];
        data.forEach((item) => {
            let dec = 0;
            let factor = 1;
            for (let i = 0; i < item.length; i++) {
                if (item[i] === 1) {
                    dec += factor;
                }
                factor *= 2;
            }
            const buf = Buffer.alloc(2, 0);
            buf.writeUInt16BE(swap16(dec));
            bufferArray.push(buf);
        });
        return Buffer.concat(bufferArray);
    }
    else
        throw new errors_1.BadRequestError('Wrong bit sequence in payload');
};
exports.bit16ArrayToBuffer = bit16ArrayToBuffer;
const bit32ArrayToBuffer = (data) => {
    if (Array.isArray(data) &&
        data.every((item) => {
            return Array.isArray(item) && item.length === 32 && item.every((bit) => bit === 1 || bit === 0);
        })) {
        const bufferArray = [];
        data.forEach((item) => {
            let dec = 0;
            let factor = 1;
            for (let i = 0; i < item.length; i++) {
                if (item[i] === 1) {
                    dec += factor;
                }
                factor *= 2;
            }
            const buf = Buffer.alloc(4, 0);
            buf.writeInt32BE(swap32(dec));
            console.log(buf);
            bufferArray.push(buf);
        });
        return Buffer.concat(bufferArray);
    }
    else
        throw new errors_1.BadRequestError('Wrong bit sequence in payload');
};
exports.bit32ArrayToBuffer = bit32ArrayToBuffer;
const byteToIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length);
        data.forEach((entry, index) => {
            buf.writeInt8(entry, index);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.byteToIntBuffer = byteToIntBuffer;
const byteToUIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length);
        data.forEach((entry, index) => {
            buf.writeUInt8(entry, index);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.byteToUIntBuffer = byteToUIntBuffer;
const wordToIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length * 2);
        data.forEach((entry, index) => {
            buf.writeInt16BE(entry, index * 2);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.wordToIntBuffer = wordToIntBuffer;
const wordToUIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length * 2);
        data.forEach((entry, index) => {
            buf.writeUInt16BE(entry, index * 2);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.wordToUIntBuffer = wordToUIntBuffer;
const dwordToIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length * 4);
        data.forEach((entry, index) => {
            buf.writeInt32BE(entry, index * 4);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.dwordToIntBuffer = dwordToIntBuffer;
const dwordToUIntBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length * 4);
        data.forEach((entry, index) => {
            buf.writeUInt32BE(entry, index * 4);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.dwordToUIntBuffer = dwordToUIntBuffer;
const floatToRealBuffer = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const buf = Buffer.allocUnsafe(data.length * 4);
        data.forEach((entry, index) => {
            buf.writeFloatBE(entry, index * 4);
        });
        return buf;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.floatToRealBuffer = floatToRealBuffer;
function swap16(val) {
    return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}
function swap32(val) {
    return ((val & 0xff) << 24) | ((val & 0xff00) << 8) | ((val >> 8) & 0xff00) | ((val >> 24) & 0xff);
}

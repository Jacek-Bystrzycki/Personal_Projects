"use strict";
//=============== S7 Read utils =================
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferRealToFloat = exports.bufferDwordToUInt = exports.bufferDwordToInt = exports.bufferWordToUInt = exports.bufferWordToInt = exports.bufferByteToUInt = exports.bufferByteToInt = exports.bufferDWordToBitArray = exports.bufferWordToBitArray = exports.bufferByteToBitArray = void 0;
const bufferByteToBitArray = (data) => {
    if (data.length > 0) {
        const bits = [];
        for (let i = 0; i < data.length; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 1, 1);
            const respString = buf.readUInt8().toString(2);
            const lenDiff = 8 - buf.readUInt8().toString(2).length;
            const bitArray = Array.from({ length: 8 }).map((_, index) => {
                if (index < lenDiff)
                    return 0;
                return respString[index - lenDiff] === '1' ? 1 : 0;
            });
            bits.push(bitArray.reverse());
        }
        return bits;
    }
    else
        return [];
};
exports.bufferByteToBitArray = bufferByteToBitArray;
const bufferWordToBitArray = (data) => {
    if (data.length > 1) {
        const bits = [];
        for (let i = 0; i < data.length; i += 2) {
            const buf = Buffer.copyBytesFrom(data, i * 1, 2);
            const respString = buf.readUInt16BE().toString(2);
            const lenDiff = 16 - buf.readUInt16BE().toString(2).length;
            const bitArray = Array.from({ length: 16 }).map((_, index) => {
                if (index < lenDiff)
                    return 0;
                return respString[index - lenDiff] === '1' ? 1 : 0;
            });
            const word = bitArray.reverse();
            bits.push([...word]);
        }
        return bits;
    }
    else
        return [];
};
exports.bufferWordToBitArray = bufferWordToBitArray;
const bufferDWordToBitArray = (data) => {
    if (data.length > 3) {
        const bits = [];
        for (let i = 0; i < data.length; i += 4) {
            const buf = Buffer.copyBytesFrom(data, i * 1, 4);
            const respString = buf.readUInt32BE().toString(2);
            const lenDiff = 32 - buf.readUInt32BE().toString(2).length;
            const bitArray = Array.from({ length: 32 }).map((_, index) => {
                if (index < lenDiff)
                    return 0;
                return respString[index - lenDiff] === '1' ? 1 : 0;
            });
            const dword = bitArray.reverse();
            bits.push([...dword]);
        }
        return bits;
    }
    else
        return [];
};
exports.bufferDWordToBitArray = bufferDWordToBitArray;
const bufferByteToInt = (data) => {
    if (data.length > 0) {
        const byte = [];
        const intAmount = data.length;
        for (let i = 0; i < intAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 1, 1);
            byte.push(buf.readInt8());
        }
        return byte;
    }
    else
        return [];
};
exports.bufferByteToInt = bufferByteToInt;
const bufferByteToUInt = (data) => {
    if (data.length > 0) {
        const byte = [];
        const intAmount = data.length;
        for (let i = 0; i < intAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 1, 1);
            byte.push(buf.readUInt8());
        }
        return byte;
    }
    else
        return [];
};
exports.bufferByteToUInt = bufferByteToUInt;
const bufferWordToInt = (data) => {
    if (data.length > 1) {
        const int = [];
        const intAmount = data.length / 2;
        for (let i = 0; i < intAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 2, 2);
            int.push(buf.readInt16BE());
        }
        return int;
    }
    else
        return [];
};
exports.bufferWordToInt = bufferWordToInt;
const bufferWordToUInt = (data) => {
    if (data.length > 1) {
        const int = [];
        const intAmount = data.length / 2;
        for (let i = 0; i < intAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 2, 2);
            int.push(buf.readUInt16BE());
        }
        return int;
    }
    else
        return [];
};
exports.bufferWordToUInt = bufferWordToUInt;
const bufferDwordToInt = (data) => {
    if (data.length > 3) {
        const dint = [];
        const dintAmount = data.length / 4;
        for (let i = 0; i < dintAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 4, 4);
            dint.push(buf.readInt32BE());
        }
        return dint;
    }
    else
        return [];
};
exports.bufferDwordToInt = bufferDwordToInt;
const bufferDwordToUInt = (data) => {
    if (data.length > 3) {
        const dint = [];
        const dintAmount = data.length / 4;
        for (let i = 0; i < dintAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 4, 4);
            dint.push(buf.readUInt32BE());
        }
        return dint;
    }
    else
        return [];
};
exports.bufferDwordToUInt = bufferDwordToUInt;
const bufferRealToFloat = (data) => {
    if (data.length > 3) {
        const float = [];
        const floatAmount = data.length / 4;
        for (let i = 0; i < floatAmount; i++) {
            const buf = Buffer.copyBytesFrom(data, i * 4, 4);
            float.push(parseFloat(buf.readFloatBE(0).toFixed(5)));
        }
        return float;
    }
    else
        return [];
};
exports.bufferRealToFloat = bufferRealToFloat;

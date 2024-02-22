"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mbFloatInvertedToDword = exports.mbFloatToDword = exports.mbUintToWord = exports.mbIntToWord = exports.mb16bitArrayToWord = exports.mbBitToWordBit = void 0;
const errors_1 = require("../../../types/server/errors");
const mbBitToWordBit = (data, currValue, startAdd) => {
    if (Array.isArray(data) &&
        data.length === 1 &&
        (data[0] === 1 || data[0] === 0) &&
        Array.isArray(currValue) &&
        currValue.every((bit) => typeof bit === 'number' && (bit === 1 || bit === 0))) {
        const bitNo = startAdd % 16;
        const resp = currValue.map((bit, index) => {
            if (index === bitNo)
                return data[0];
            return bit;
        });
        return [resp];
    }
    else
        throw new errors_1.BadRequestError('Wrong bit sequence in payload');
};
exports.mbBitToWordBit = mbBitToWordBit;
const mb16bitArrayToWord = (data) => {
    if (Array.isArray(data) &&
        data.every((item) => {
            return Array.isArray(item) && item.length === 16 && item.every((bit) => bit === 1 || bit === 0);
        })) {
        const resp = [];
        data.forEach((item) => {
            let dec = 0;
            let factor = 1;
            for (let i = 0; i < item.length; i++) {
                if (item[i] === 1) {
                    dec += factor;
                }
                factor *= 2;
            }
            const value = new Uint32Array([dec])[0];
            resp.push(value);
        });
        return resp;
    }
    else
        throw new errors_1.BadRequestError('Wrong bit sequence in payload');
};
exports.mb16bitArrayToWord = mb16bitArrayToWord;
const mbIntToWord = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const resp = [];
        new Uint16Array(data).forEach((value) => resp.push(value));
        return resp;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.mbIntToWord = mbIntToWord;
const mbUintToWord = (data) => {
    return (0, exports.mbIntToWord)(data);
};
exports.mbUintToWord = mbUintToWord;
const mbFloatToDword = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const resp = [];
        data.forEach((value) => {
            const arr32 = new Float32Array([value]).buffer;
            const arr16 = new Uint16Array(arr32);
            arr16.forEach((word) => resp.push(word));
        });
        return resp;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.mbFloatToDword = mbFloatToDword;
const mbFloatInvertedToDword = (data) => {
    if (Array.isArray(data) && data.every((item) => typeof item === 'number')) {
        const resp = [];
        data.forEach((value) => {
            const arr32 = new Float32Array([value]).buffer;
            const arr16 = new Uint16Array(arr32).reverse();
            arr16.forEach((word) => {
                resp.push(word);
            });
        });
        return resp;
    }
    else
        throw new errors_1.BadRequestError('Wrong data in payload');
};
exports.mbFloatInvertedToDword = mbFloatInvertedToDword;

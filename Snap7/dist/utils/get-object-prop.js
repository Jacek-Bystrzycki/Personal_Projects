"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectValue = void 0;
const getObjectValue = (object, key) => {
    return object.map((item) => item[key]);
};
exports.getObjectValue = getObjectValue;

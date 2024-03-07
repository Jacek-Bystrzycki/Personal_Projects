"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uaTransformReadValue = exports.uaLimitValue = void 0;
const node_opcua_client_1 = require("node-opcua-client");
const errors_1 = require("../../../types/server/errors");
const uaLimitValue = (value, type) => {
    switch (type) {
        case node_opcua_client_1.DataType.Boolean:
            return !!value;
        case node_opcua_client_1.DataType.Byte:
            if (value > 255)
                return 255;
            else if (value < 0)
                return 0;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.SByte:
            if (value > 127)
                return 127;
            else if (value < -128)
                return -128;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.UInt16:
            if (value > 65535)
                return 65535;
            else if (value < 0)
                return 0;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.UInt32:
            if (value > 4294967295)
                return 4294967295;
            else if (value < 0)
                return 0;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.Int16:
            if (value > 32767)
                return 32767;
            else if (value < -32768)
                return -32768;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.Int32:
            if (value > 2147483647)
                return 2147483647;
            else if (value < -2147483648)
                return -2147483648;
            else
                return Math.round(value);
        case node_opcua_client_1.DataType.Float:
            return value;
        case node_opcua_client_1.DataType.Double:
            return value;
        default:
            throw new errors_1.BadRequestError('Unsupported data type');
    }
};
exports.uaLimitValue = uaLimitValue;
const uaTransformReadValue = (value) => {
    if (typeof value !== 'boolean')
        return value;
    return value ? 1 : 0;
};
exports.uaTransformReadValue = uaTransformReadValue;

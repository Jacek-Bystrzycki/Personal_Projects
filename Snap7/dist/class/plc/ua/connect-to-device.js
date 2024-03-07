"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UA_ConnectToDevice = void 0;
const node_opcua_client_1 = require("node-opcua-client");
const fixed_1 = require("set-interval-async/fixed");
const limitValue_1 = require("../../../utils/plc/ua/limitValue");
const errors_1 = require("../../../types/server/errors");
const errors_2 = require("../../../types/server/errors");
class UA_ConnectToDevice {
    constructor(endpointUrl, tagsDefs) {
        this.endpointUrl = endpointUrl;
        this.tagsDefs = tagsDefs;
        this._syncQueue = [];
        this.loop = () => {
            (0, fixed_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.connectToServer();
                    const session = yield this._client.createSession();
                    //====READ======
                    for (const tag of this._readBuffer) {
                        try {
                            const { data, isError, status } = yield this.readTag(session, tag);
                            tag.data = data;
                            tag.isError = isError;
                            tag.status = status;
                        }
                        catch (error) {
                            tag.data = null;
                            tag.isError = true;
                            if (error instanceof errors_1.BadRequestError) {
                                tag.status = error.message;
                            }
                            else
                                tag.status = 'Bad';
                        }
                    }
                    //====WRTIE=====
                    for (const [index, tag] of this._writeBuffer.entries()) {
                        if (tag.execute) {
                            tag.execute = false;
                            const { isError, status } = yield this.writeTag(session, tag, this._readBuffer[index]);
                            tag.isError = isError;
                            tag.status = status;
                        }
                    }
                    //====WRTIE SYNC=====
                    for (const query of this._syncQueue) {
                        if (!query.isDone && !query.isError) {
                            for (const [i, index] of query.tags.entries()) {
                                const dataToWrite = Object.assign(Object.assign({}, this._writeBuffer[index - 1]), { data: query.data[i] });
                                try {
                                    yield this.writeTag(session, dataToWrite, this._readBuffer[index - 1]);
                                    if (i === query.tags.length - 1) {
                                        query.status = 'Query Done';
                                        query.isDone = true;
                                    }
                                }
                                catch (error) {
                                    query.isError = true;
                                    if (error instanceof errors_2.InternalError) {
                                        query.status = error.message;
                                    }
                                    else
                                        query.status = 'Unknown Error during writing';
                                }
                            }
                        }
                    }
                    //===================
                    yield session.close();
                }
                catch (error) {
                    this._readBuffer.forEach((tag) => {
                        tag.data = null;
                        tag.isError = true;
                        tag.status = 'BadCommunicationError';
                    });
                }
                finally {
                    yield this._client.disconnect();
                }
            }), 100);
        };
        this.connectToServer = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this._client
                    .connect(this.endpointUrl)
                    .then(() => resolve())
                    .catch(() => {
                    reject(new Error('Connection Error!'));
                });
            });
            const timeout = new Promise((_, rej) => {
                setTimeout(() => {
                    rej(new Error('Reconnect Timeout!'));
                }, 3000);
            });
            return Promise.race([promise, timeout]);
        });
        this.readTag = (session, readTag) => __awaiter(this, void 0, void 0, function* () {
            const data = yield session.read({
                nodeId: readTag.nodeId,
                attributeId: node_opcua_client_1.AttributeIds.Value,
            });
            if (data.value.dataType === readTag.dataType) {
                return {
                    data: data.value.toJSON().value,
                    isError: !data.statusCode.isGood(),
                    status: data.statusCode.name,
                };
            }
            else
                throw new errors_1.BadRequestError(`Bad_TypeMismatch ReadTag: ${readTag.nodeId}`);
        });
        this.writeTag = (session, writeTag, readTag) => __awaiter(this, void 0, void 0, function* () {
            if (writeTag.dataType === readTag.dataType && writeTag.data) {
                try {
                    yield session.write({
                        nodeId: writeTag.nodeId,
                        attributeId: node_opcua_client_1.AttributeIds.Value,
                        value: {
                            value: {
                                dataType: writeTag.dataType,
                                value: (0, limitValue_1.uaLimitValue)(writeTag.data, writeTag.dataType),
                            },
                        },
                    });
                }
                catch (error) {
                    if (error instanceof errors_1.BadRequestError) {
                        throw new errors_1.BadRequestError(error.message);
                    }
                    else
                        throw new errors_1.BadRequestError('WriteTag - Unknown error');
                }
                return {
                    isError: readTag.isError,
                    status: readTag.status,
                };
            }
            else
                throw new errors_1.BadRequestError(`Bad_TypeMismatch WriteTag: ${readTag.nodeId}`);
        });
        this.addToSyncQueue = (data) => {
            this._syncQueue.push(data);
        };
        this.removeFromSyncQueue = (id) => {
            this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
        };
        this._connStrategy = {
            initialDelay: 100,
            maxRetry: 100,
            maxDelay: 200,
        };
        this._options = {
            applicationName: 'OPC-UA-Client',
            connectionStrategy: this._connStrategy,
            securityMode: node_opcua_client_1.MessageSecurityMode.None,
            securityPolicy: node_opcua_client_1.SecurityPolicy.None,
            endpointMustExist: false,
        };
        this._client = node_opcua_client_1.OPCUAClient.create(this._options);
        this._readBuffer = this.tagsDefs.map((tagDef) => {
            return {
                id: tagDef.id,
                nodeId: node_opcua_client_1.NodeId.resolveNodeId(tagDef.nodeId),
                data: null,
                dataType: UA_ConnectToDevice.getDataType(tagDef.dataType),
                isError: true,
                status: 'Bad. Init Conn.',
            };
        });
        this._writeBuffer = this.tagsDefs.map((tagDef) => {
            return {
                id: tagDef.id,
                execute: false,
                nodeId: node_opcua_client_1.NodeId.resolveNodeId(tagDef.nodeId),
                dataType: UA_ConnectToDevice.getDataType(tagDef.dataType),
                data: null,
                isError: true,
                status: 'Bad. Init Conn.',
            };
        });
        this.loop();
    }
    get readBuffer() {
        return this._readBuffer;
    }
    get writeBuffer() {
        return this._writeBuffer;
    }
    set writeBuffer(data) {
        this._writeBuffer = data;
    }
    get syncQueue() {
        return this._syncQueue;
    }
}
exports.UA_ConnectToDevice = UA_ConnectToDevice;
UA_ConnectToDevice.getDataType = (type) => {
    switch (type) {
        case 'Boolean':
            return node_opcua_client_1.DataType.Boolean;
        case 'SByte':
            return node_opcua_client_1.DataType.SByte;
        case 'Byte':
            return node_opcua_client_1.DataType.Byte;
        case 'Int16':
            return node_opcua_client_1.DataType.Int16;
        case 'UInt16':
            return node_opcua_client_1.DataType.UInt16;
        case 'Int32':
            return node_opcua_client_1.DataType.Int32;
        case 'UInt32':
            return node_opcua_client_1.DataType.UInt32;
        case 'Float':
            return node_opcua_client_1.DataType.Float;
        case 'Double':
            return node_opcua_client_1.DataType.Double;
        default:
            throw new Error('Wrong Data type');
    }
};

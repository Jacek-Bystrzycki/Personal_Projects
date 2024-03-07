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
exports.UA_CreateConnections = void 0;
const connect_to_device_1 = require("./connect-to-device");
const node_opcua_client_1 = require("node-opcua-client");
const limitValue_1 = require("../../../utils/plc/ua/limitValue");
const errors_1 = require("../../../types/server/errors");
const nanoid_1 = require("nanoid");
const serachQuery_1 = require("../../../utils/plc/serachQuery");
const waitUntil_1 = require("../../../utils/waitUntil");
class UA_CreateConnections {
    constructor(uaDefinitions) {
        this.uaDefinitions = uaDefinitions;
        this.createConnections = () => {
            const instances = this.uaDefinitions.map((item) => {
                return new connect_to_device_1.UA_ConnectToDevice(...item);
            });
            return instances.map((instance, index) => {
                return { id: index + 1, instance };
            });
        };
        this.ua_readFromServer = (id, tags) => {
            const resp = [];
            id.forEach((singleId, index) => {
                tags[index].forEach((tag) => {
                    const currentTag = this._instances.find((id) => id.id === singleId).instance.readBuffer.find((searchTag) => searchTag.id === tag);
                    const data = {
                        deviceId: singleId,
                        id: currentTag.id,
                        isError: currentTag.isError,
                        status: currentTag.status,
                        dataType: UA_CreateConnections.setDataType(currentTag.dataType),
                        value: (0, limitValue_1.uaTransformReadValue)(currentTag.data),
                    };
                    resp.push(data);
                });
            });
            return resp;
        };
        this.ua_writeToServer = (dataToWrite) => {
            const idIndex = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);
            dataToWrite.writeTags.forEach((tag) => {
                const tagIndex = this._instances[idIndex].instance.writeBuffer.findIndex((searchTag) => searchTag.id === tag.tagId);
                if (this._instances[idIndex].instance.readBuffer[tagIndex].isError)
                    throw new errors_1.InternalError(this._instances[idIndex].instance.writeBuffer[tagIndex].status);
                this._instances[idIndex].instance.writeBuffer[tagIndex].execute = true;
                this._instances[idIndex].instance.writeBuffer[tagIndex].data = tag.data;
            });
        };
        this.ua_writToServerSync = (dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const idIndex = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);
            const query = {
                queryId: (0, nanoid_1.nanoid)(),
                tags: dataToWrite.writeTags.map((tag) => tag.tagId),
                data: dataToWrite.writeTags.map((tag) => tag.data),
                isDone: false,
                isError: false,
                status: 'Not triggered',
            };
            this._instances[idIndex].instance.addToSyncQueue(query);
            try {
                yield (0, waitUntil_1.waitUntil)(() => (0, serachQuery_1.searchQueueForDone)(query.queryId, this._instances[idIndex].instance.syncQueue), () => (0, serachQuery_1.searchQueueForError)(query.queryId, this._instances[idIndex].instance.syncQueue), () => (0, serachQuery_1.searchQueueForErrorMsg)(query.queryId, this._instances[idIndex].instance.syncQueue));
                return {
                    queryId: query.queryId,
                    isDone: query.isDone,
                    status: query.status,
                    tags: query.tags,
                };
            }
            catch (error) {
                if (typeof error === 'string')
                    throw new errors_1.InternalError(error);
                else
                    throw new errors_1.InternalError('Unknown error');
            }
            finally {
                this._instances[idIndex].instance.removeFromSyncQueue(query.queryId);
            }
        });
        this._instances = this.createConnections();
    }
    get instances() {
        return this._instances;
    }
}
exports.UA_CreateConnections = UA_CreateConnections;
UA_CreateConnections.setDataType = (type) => {
    switch (type) {
        case node_opcua_client_1.DataType.Boolean:
            return 'Boolean';
        case node_opcua_client_1.DataType.SByte:
            return 'SByte';
        case node_opcua_client_1.DataType.Byte:
            return 'Byte';
        case node_opcua_client_1.DataType.Int16:
            return 'Int16';
        case node_opcua_client_1.DataType.UInt16:
            return 'UInt16';
        case node_opcua_client_1.DataType.Int32:
            return 'Int32';
        case node_opcua_client_1.DataType.UInt32:
            return 'UInt32';
        case node_opcua_client_1.DataType.Float:
            return 'Float';
        case node_opcua_client_1.DataType.Double:
            return 'Double';
        default:
            throw new Error('Wrong Data type');
    }
};

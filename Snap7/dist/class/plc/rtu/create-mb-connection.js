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
exports.RTU_CreateConnection = void 0;
const connect_to_device_1 = require("./connect-to-device");
const errors_1 = require("../../../types/server/errors");
const nanoid_1 = require("nanoid");
const waitUntil_1 = require("../../../utils/waitUntil");
const serachQuery_1 = require("../../../utils/plc/serachQuery");
class RTU_CreateConnection {
    constructor(rtuDefinitions) {
        this.rtuDefinitions = rtuDefinitions;
        this.rtu_readFromDevice = (id, tags) => {
            const resp = [];
            id.forEach((singleId, index) => {
                tags[index].forEach((tag) => {
                    const currentTag = this._instances.instance.readBuffer.find((device) => device.uId === singleId).tags.find((searchTag) => searchTag.id === tag);
                    const data = {
                        isError: currentTag.isError,
                        status: currentTag.status,
                        data: currentTag.data,
                        id: currentTag.id,
                        len: currentTag.params.len,
                        format: currentTag.format,
                        address: {
                            deviceId: singleId,
                            type: 'rtu',
                            holdingRegister: currentTag.params.start,
                            amount: currentTag.params.count,
                        },
                    };
                    resp.push(data);
                });
            });
            return resp;
        };
        this.rtu_writeToDevice = (dataToWrite) => {
            const idIndex = this._instances.instance.writeBufferConsistent.findIndex((device) => device.uId === dataToWrite.instanceId);
            dataToWrite.writeTags.forEach((tag) => {
                const tagIndex = this._instances.instance.writeBufferConsistent[idIndex].tags.findIndex((searchTag) => searchTag.id === tag.tagId);
                if (this._instances.instance.readBuffer[idIndex].tags[tagIndex].isError)
                    throw new errors_1.InternalError(this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].status);
                this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].execute = true;
                this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].params.data = tag.data;
            });
        };
        this.rtu_writeToDeviceSync = (dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const query = {
                queryId: (0, nanoid_1.nanoid)(),
                uId: dataToWrite.instanceId,
                tags: dataToWrite.writeTags.map((tag) => tag.tagId),
                data: dataToWrite.writeTags.map((tag) => tag.data),
                isDone: false,
                isError: false,
                status: 'Not triggered',
            };
            this._instances.instance.addToSyncQueue(query);
            try {
                yield (0, waitUntil_1.waitUntil)(() => (0, serachQuery_1.searchQueueForDone)(query.queryId, this._instances.instance.syncQueue), () => (0, serachQuery_1.searchQueueForError)(query.queryId, this._instances.instance.syncQueue), () => (0, serachQuery_1.searchQueueForErrorMsg)(query.queryId, this._instances.instance.syncQueue));
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
                this._instances.instance.removeFromSyncQueue(query.queryId);
            }
        });
        this._instances = { id: 1, instance: new connect_to_device_1.RTU_ConnectToDevice(...this.rtuDefinitions) };
    }
    get instances() {
        return this._instances;
    }
}
exports.RTU_CreateConnection = RTU_CreateConnection;

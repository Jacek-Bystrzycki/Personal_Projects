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
exports.S7_CreateConnections = void 0;
const connect_to_plc_1 = require("./connect-to-plc");
const errors_1 = require("../../../types/server/errors");
const waitUntil_1 = require("../../../utils/waitUntil");
const nanoid_1 = require("nanoid");
const serachQuery_1 = require("../../../utils/plc/serachQuery");
class S7_CreateConnections {
    constructor(params) {
        this.params = params;
        this.s7_createConnctions = () => {
            const plcInstances = this.params.map((plc) => {
                return new connect_to_plc_1.S7_ConnectToPlc(...plc);
            });
            return plcInstances.map((instance, index) => {
                return { id: index + 1, instance };
            });
        };
        this.s7_readData = (id, tags) => {
            const resp = [];
            id.forEach((singleId, index) => {
                tags[index].forEach((tag) => {
                    const currentTag = this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag);
                    const data = {
                        isError: currentTag.isError,
                        status: currentTag.status,
                        data: currentTag.data,
                        id: currentTag.id,
                        format: currentTag.format,
                        wordLen: currentTag.params.WordLen,
                        address: {
                            deviceId: singleId,
                            type: 's7',
                            db: currentTag.params.DBNumber,
                            startAddr: currentTag.params.Start,
                            amount: currentTag.params.Amount,
                        },
                    };
                    resp.push(data);
                });
            });
            return resp;
        };
        this.s7_writeData = (dataToWrite) => {
            const idIndex = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);
            dataToWrite.writeTags.forEach((tag) => {
                const tagIndex = this._instances[idIndex].instance.writeBufferConsistent.findIndex((searchTag) => searchTag.id === tag.tagId);
                if (this._instances[idIndex].instance.readBufferConsistent[tagIndex].isError)
                    throw new errors_1.InternalError(this._instances[idIndex].instance.writeBufferConsistent[tagIndex].status);
                this._instances[idIndex].instance.writeBufferConsistent[tagIndex].execute = true;
                this._instances[idIndex].instance.writeBufferConsistent[tagIndex].params.Data = tag.data;
            });
        };
        this.s7_writeDataSync = (dataToWrite) => __awaiter(this, void 0, void 0, function* () {
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
        this._instances = this.s7_createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreateConnections = S7_CreateConnections;

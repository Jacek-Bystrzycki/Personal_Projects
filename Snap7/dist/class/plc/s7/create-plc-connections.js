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
                    const data = {
                        isError: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).isError,
                        status: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).status,
                        data: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).data,
                        id: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).id,
                        format: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).format,
                        wordLen: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params.WordLen,
                        address: {
                            deviceId: singleId,
                            type: 's7',
                            db: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params.DBNumber,
                            startAddr: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params.Start,
                            amount: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params.Amount,
                        },
                    };
                    resp.push(data);
                });
            });
            return resp;
        };
        this.s7_writeData = (dataToWrite) => {
            dataToWrite.writeTags.forEach((tag, i) => {
                var _a;
                if ((_a = this._instances
                    .find((searchId) => searchId.id === dataToWrite.instanceId)
                    .instance.readBufferConsistent.find((searchTag) => searchTag.id === tag.tagId)) === null || _a === void 0 ? void 0 : _a.isError)
                    throw new errors_1.InternalError(this._instances
                        .find((searchId) => searchId.id === dataToWrite.instanceId)
                        .instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId).status);
                this._instances
                    .find((searchId) => searchId.id === dataToWrite.instanceId)
                    .instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId).execute = true;
                this._instances
                    .find((searchId) => searchId.id === dataToWrite.instanceId)
                    .instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId).params.Data = dataToWrite.writeTags[i].data;
            });
        };
        this.s7_writeDataSync = (dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const query = {
                queryId: (0, nanoid_1.nanoid)(),
                indexes: dataToWrite.writeTags.map((tag) => tag.tagId),
                data: dataToWrite.writeTags.map((tag) => tag.data),
                isDone: false,
                isError: false,
                errorMsg: '',
            };
            this._instances.find((searchId) => searchId.id === dataToWrite.instanceId).instance.addToSyncQueue(query);
            try {
                yield (0, waitUntil_1.waitUntil)(() => (0, serachQuery_1.searchQueueForDone)(query.queryId, this._instances.find((searchId) => searchId.id === dataToWrite.instanceId).instance.syncQueue), () => (0, serachQuery_1.searchQueueForError)(query.queryId, this._instances.find((searchId) => searchId.id === dataToWrite.instanceId).instance.syncQueue), () => (0, serachQuery_1.searchQueueForErrorMsg)(query.queryId, this._instances.find((searchId) => searchId.id === dataToWrite.instanceId).instance.syncQueue));
            }
            catch (error) {
                if (typeof error === 'string')
                    throw new errors_1.InternalError(error);
                else
                    throw new errors_1.InternalError('Unknown error');
            }
            finally {
                this._instances.find((searchId) => searchId.id === dataToWrite.instanceId).instance.removeFromSyncQueue(query.queryId);
            }
        });
        this._instances = this.s7_createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreateConnections = S7_CreateConnections;

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
exports.MB_CreateConnections = void 0;
const connect_to_devide_1 = require("./connect-to-devide");
const errors_1 = require("../../../types/server/errors");
const nanoid_1 = require("nanoid");
const serachQuery_1 = require("../../../utils/plc/serachQuery");
const waitUntil_1 = require("../../../utils/waitUntil");
class MB_CreateConnections {
    constructor(deviceDefinitions) {
        this.deviceDefinitions = deviceDefinitions;
        this.createConnections = () => {
            const instances = this.deviceDefinitions.map((item) => {
                return new connect_to_devide_1.MB_ConnectToDevice(...item);
            });
            return instances.map((instance, index) => {
                return { id: index + 1, instance };
            });
        };
        this.mb_readFromDevice = (id, tags) => {
            const resp = [];
            id.forEach((singleId, index) => {
                tags[index].forEach((tag) => {
                    const data = {
                        isError: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).isError,
                        status: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).status,
                        data: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).data,
                        id: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).id,
                        format: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).format,
                        address: {
                            deviceId: singleId,
                            type: 'mb',
                            holdingRegister: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params
                                .start,
                            amount: this._instances.find((id) => id.id === singleId).instance.readBufferConsistent.find((searchTag) => searchTag.id === tag).params.count,
                        },
                    };
                    resp.push(data);
                });
            });
            return resp;
        };
        this.mb_writeToDevice = (id, indexes, dataToWrite) => {
            const dataIndex = this._instances.findIndex((item) => item.id === id);
            if (dataIndex === -1)
                throw new errors_1.BadRequestError(`Instance ${id} not exists`);
            indexes.forEach((index, i) => {
                if (this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.writeBufferConsistent[index - 1].status);
                this._instances[dataIndex].instance.writeBufferConsistent[index - 1].execute = true;
                this._instances[dataIndex].instance.writeBufferConsistent[index - 1].params.data = dataToWrite[i];
            });
        };
        this.mb_writeToDeviceSync = (id, indexes, dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            const query = {
                queryId: (0, nanoid_1.nanoid)(),
                indexes,
                data: dataToWrite,
                isDone: false,
                isError: false,
                errorMsg: '',
            };
            this._instances[dataIndex].instance.addToSyncQueue(query);
            try {
                yield (0, waitUntil_1.waitUntil)(() => (0, serachQuery_1.searchQueueForDone)(query.queryId, this._instances[dataIndex].instance.syncQueue), () => (0, serachQuery_1.searchQueueForError)(query.queryId, this._instances[dataIndex].instance.syncQueue), () => (0, serachQuery_1.searchQueueForErrorMsg)(query.queryId, this._instances[dataIndex].instance.syncQueue));
            }
            catch (error) {
                if (typeof error === 'string')
                    throw new errors_1.InternalError(error);
                else
                    throw new errors_1.InternalError('Unknown error');
            }
            finally {
                this._instances[dataIndex].instance.removeFromSyncQueue(query.queryId);
            }
        });
        this._instances = this.createConnections();
    }
    get instances() {
        return this._instances;
    }
}
exports.MB_CreateConnections = MB_CreateConnections;

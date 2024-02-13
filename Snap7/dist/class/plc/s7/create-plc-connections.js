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
class S7_CreateConnections {
    constructor(params) {
        this.params = params;
        this.s7_createConnctions = () => {
            const plcInstances = this.params.plcDefinitions.map((plc) => {
                return new connect_to_plc_1.S7_ConnectToPlc(...plc);
            });
            return plcInstances.map((instance, index) => {
                return { id: index + 1, instance };
            });
        };
        this.s7_readData = (id, indexes) => {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            const data = [];
            indexes.forEach((index) => {
                if (this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.readBufferConsistent[index - 1].status);
                data.push(this._instances[dataIndex].instance.readBufferConsistent[index - 1].data);
            });
            if (data.length < 1)
                throw new errors_1.InternalError('Empty data');
            return data;
        };
        this.s7_writeData = (id, indexes, dataToWrite) => {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            indexes.forEach((index, i) => {
                this._instances[dataIndex].instance.writeBufferConsistent[index - 1].execute = true;
                if (this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.writeBufferConsistent[index - 1].status);
                this._instances[dataIndex].instance.writeBufferConsistent[index - 1].params.Data = dataToWrite[i];
            });
        };
        this.s7_writeDataSync = (id, indexes, dataToWrite) => __awaiter(this, void 0, void 0, function* () {
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
            const searchQueueForDone = (id) => {
                const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
                return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.isDone) === true;
            };
            const searchQueueForError = (id) => {
                const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
                return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.isError) === true;
            };
            const searchQueueForErrorMsg = (id) => {
                const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
                return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.errorMsg) || 'No message';
            };
            try {
                yield (0, waitUntil_1.waitUntil)(() => searchQueueForDone(query.queryId), () => searchQueueForError(query.queryId), () => searchQueueForErrorMsg(query.queryId));
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
        this._instances = this.s7_createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreateConnections = S7_CreateConnections;

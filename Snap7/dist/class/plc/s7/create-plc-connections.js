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
            if (dataIndex === -1)
                throw new errors_1.BadRequestError(`Instance ${id} not exists`);
            if (!indexes.every((index) => typeof this._instances[dataIndex].instance.readBuffer[index - 1] !== 'undefined')) {
                throw new errors_1.BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
            }
            const data = [];
            indexes.forEach((index) => {
                if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.readBuffer[index - 1].status);
                data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
            });
            if (data.length < 1)
                throw new errors_1.InternalError('Empty data');
            return data;
        };
        this.s7_writeData = (id, indexes, dataToWrite) => {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            indexes.forEach((index, i) => {
                this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
                if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.writeBuffer[index - 1].status);
                this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
            });
        };
        this.s7_writeDataSync = (id, indexes, dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            indexes.forEach((index, i) => {
                this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
                if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
                    throw new errors_1.InternalError(this._instances[dataIndex].instance.writeBuffer[index - 1].status);
                this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
            });
            this._instances[dataIndex].instance.isSyncBusy = true;
            yield (0, waitUntil_1.waitUntil)(() => !this._instances[dataIndex].instance.isSyncBusy);
        });
        this._instances = this.s7_createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreateConnections = S7_CreateConnections;

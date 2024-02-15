"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MB_CreateConnections = void 0;
const connect_to_devide_1 = require("./connect-to-devide");
const errors_1 = require("../../../types/server/errors");
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
        this.mb_readFromDevice = (id, indexes) => {
            const dataIndex = this._instances.findIndex((item) => item.id === id);
            if (dataIndex === -1)
                throw new errors_1.BadRequestError(`Instance ${id} not exists`);
            if (!indexes.every((index) => typeof this._instances[dataIndex].instance.readBuffer[index - 1] !== 'undefined')) {
                throw new errors_1.BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
            }
            // if (!this._instances[dataIndex].instance.isConnected) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);
            const data = [];
            indexes.forEach((index) => {
                data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
            });
            return data;
        };
        this.mb_writeToDevice = (id, indexes, dataToWrite) => {
            const dataIndex = this._instances.findIndex((item) => item.id === id);
            if (dataIndex === -1)
                throw new errors_1.BadRequestError(`Instance ${id} not exists`);
            // if (!this._instances[dataIndex].instance.isConnected) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);
            if (indexes.length !== dataToWrite.length)
                throw new errors_1.BadRequestError('Wrong amount of data');
            if (!indexes.every((index) => typeof this._instances[dataIndex].instance.writeBuffer[index - 1] !== 'undefined'))
                throw new errors_1.BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
            indexes.forEach((index, i) => {
                this._instances[dataIndex].instance.writeBuffer[index - 1].params.data = dataToWrite[i];
                this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
            });
        };
        this._instances = this.createConnections();
    }
    get instances() {
        return this._instances;
    }
}
exports.MB_CreateConnections = MB_CreateConnections;

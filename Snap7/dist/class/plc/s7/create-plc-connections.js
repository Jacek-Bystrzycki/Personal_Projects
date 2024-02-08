"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S7_CreateConnections = void 0;
const connect_to_plc_1 = require("./connect-to-plc");
const errors_1 = require("../../../types/server/errors");
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
            if (this._instances[dataIndex].instance.isError)
                throw new errors_1.InternalError(this._instances[dataIndex].instance.lastErrorMsg);
            const data = [];
            indexes.forEach((index) => {
                data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
            });
            if (data.length < 1)
                throw new errors_1.InternalError('Empty data');
            return data;
        };
        this.s7_writeData = (id, indexes, dataToWrite) => {
            const dataIndex = this._instances.findIndex((instance) => instance.id === id);
            if (this._instances[dataIndex].instance.isError)
                throw new errors_1.InternalError(this._instances[dataIndex].instance.lastErrorMsg);
            indexes.forEach((index, i) => {
                this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
                this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
            });
        };
        this._instances = this.s7_createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreateConnections = S7_CreateConnections;

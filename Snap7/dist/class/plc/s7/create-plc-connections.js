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
exports.S7_CreatePlcConnections = void 0;
const connect_to_plc_1 = require("./connect-to-plc");
class S7_CreatePlcConnections {
    constructor(plcDefinitions, readMultiVar, writeMultiVar) {
        this.plcDefinitions = plcDefinitions;
        this.readMultiVar = readMultiVar;
        this.writeMultiVar = writeMultiVar;
        this.createConnctions = () => {
            const plcInstances = this.plcDefinitions.map((plc) => {
                return new connect_to_plc_1.S7_ConnectToPlc(...plc);
            });
            return plcInstances.map((instance) => {
                return { id: instance.id, instance };
            });
        };
        this.readData = (id, indexes) => __awaiter(this, void 0, void 0, function* () {
            const instanceToRead = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (!instanceToRead) {
                throw new Error(`Instance ${id} not exists`);
            }
            const multiVar = this.readMultiVar[id - 1];
            if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined'))
                throw new Error(`Not all indexes [${indexes}] exist in params definitions`);
            instanceToRead.instance.readBuffer = indexes.map((index) => multiVar[index - 1]);
            yield instanceToRead.instance.connectPlc();
            return instanceToRead.instance.readFromPlc(instanceToRead.instance.readBuffer);
        });
        this.writeData = (id, indexes, dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const instanceToWrite = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (!instanceToWrite)
                throw new Error(`Instance ${id} not exists`);
            if (indexes.length !== dataToWrite.length)
                throw new Error(`Data to write not match indexes`);
            let multiVar = this.writeMultiVar[id - 1];
            if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined'))
                throw new Error(`Not all indexes [${indexes}] exist in params definitions`);
            instanceToWrite.instance.writeBuffer = indexes.map((index) => {
                return Object.assign(Object.assign({}, multiVar[index - 1]), { Data: dataToWrite[index - 1] });
            });
            yield instanceToWrite.instance.connectPlc();
            return instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
        });
        this._instances = this.createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreatePlcConnections = S7_CreatePlcConnections;

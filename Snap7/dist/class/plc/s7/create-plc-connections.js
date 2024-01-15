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
exports.CreatePlcConnections = void 0;
const connect_to_plc_1 = require("./connect-to-plc");
class CreatePlcConnections {
    constructor(plcDefinitions) {
        this.plcDefinitions = plcDefinitions;
        this.createConnctions = () => {
            const plcInstances = this.plcDefinitions.map((plc) => {
                return new connect_to_plc_1.ConnectToPlc(...plc);
            });
            return plcInstances.map((instance) => {
                return { id: instance.id, instance };
            });
        };
        this.connectToPlc = (id) => {
            const instanceToConnect = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (instanceToConnect)
                instanceToConnect.instance.controlPlcConnection();
        };
        this.connectionStatus = (id) => {
            const instanceToStatus = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (instanceToStatus)
                return instanceToStatus.instance.connected;
            return false;
        };
        this.readData = (id, db, start, len) => __awaiter(this, void 0, void 0, function* () {
            const instanceToRead = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (this.connectionStatus(id)) {
                if (!instanceToRead)
                    return console.log(`Instance ${id} not exists`);
                return yield instanceToRead.instance.readFromPlc(db, start, len);
            }
            else
                console.log(`Cannot read while unconnected to PLC: ${id}`);
        });
        this.writeData = (id, db, start, len) => __awaiter(this, void 0, void 0, function* () {
            const instanceToWrite = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (this.connectionStatus(id)) {
                if (!instanceToWrite)
                    return console.log(`Instance ${id} not exists`);
                const data = instanceToWrite.instance.writeBuffer;
                yield instanceToWrite.instance.writeToPlc(db, start, len, data);
            }
            else
                console.log(`Cannot write while unconnected to PLC: ${id}`);
        });
        this.setWriteBuffer = (id, data) => {
            const instanceToSetBuffer = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (!instanceToSetBuffer)
                return console.log(`Instance ${id} not exists`);
            instanceToSetBuffer.instance.writeBuffer = data;
        };
        this._instances = this.createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.CreatePlcConnections = CreatePlcConnections;

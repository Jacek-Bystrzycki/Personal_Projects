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
class MB_CreateConnections {
    constructor(deviceDefinitions) {
        this.deviceDefinitions = deviceDefinitions;
        this.createConnections = () => {
            const instances = this.deviceDefinitions.map((item) => {
                return new connect_to_devide_1.MB_ConnectToDevice(...item);
            });
            return instances.map((instance) => {
                return { id: instance.id, instance };
            });
        };
        this.mb_ReadFromDevice = (id, regs) => __awaiter(this, void 0, void 0, function* () {
            const instanceToRead = this._instances.find((item) => {
                return item.id === id;
            });
            if (!instanceToRead)
                throw new Error(`Instance ${id} not exists`);
            return instanceToRead.instance.mb_ReadRegisters(regs);
        });
        this.mb_WriteToDevice = (id, start, data) => __awaiter(this, void 0, void 0, function* () {
            const instanceToWrite = this._instances.find((item) => {
                return item.id === id;
            });
            if (!instanceToWrite)
                throw new Error(`Instance ${id} not exists`);
            return instanceToWrite.instance.mb_WriteRegisters(start, data);
        });
        this._instances = this.createConnections();
    }
    get instances() {
        return this._instances;
    }
}
exports.MB_CreateConnections = MB_CreateConnections;

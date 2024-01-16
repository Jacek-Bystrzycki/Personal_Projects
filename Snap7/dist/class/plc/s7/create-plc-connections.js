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
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
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
        this.readData = (id) => __awaiter(this, void 0, void 0, function* () {
            const instanceToRead = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (!instanceToRead) {
                console.log(`Instance ${id} not exists`);
                return [];
            }
            const multiVar = this.readMultiVar[id - 1];
            instanceToRead.instance.readBuffer = multiVar;
            try {
                yield instanceToRead.instance.connectPlc();
                return yield instanceToRead.instance.readFromPlc(instanceToRead.instance.readBuffer);
            }
            catch (error) {
                console.log(`${(0, get_date_as_string_1.getDateAsString)()}Cannot read from PLC id: ${id}: ${error}`);
                return [];
            }
        });
        // public writeData = async (id: number, writeMultiVar: snap7.MultiVarWrite[][]): Promise<void> => {
        //   const instanceToWrite = this._instances.find((instance) => {
        //     return instance.id === id;
        //   });
        //   if (!instanceToWrite) return console.log(`Instance ${id} not exists`);
        //   const multiVar: snap7.MultiVarWrite[] = writeMultiVar[id - 1];
        //   instanceToWrite.instance.writeBuffer = multiVar;
        //   try {
        //     await instanceToWrite.instance.connectPlc();
        //     await instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
        //   } catch (error) {
        //     console.log(`${getDateAsString()}Cannot write to PLC id: ${id}: ${error}`);
        //   }
        // };
        this.writeData = (id, dataToWrite) => __awaiter(this, void 0, void 0, function* () {
            const instanceToWrite = this._instances.find((instance) => {
                return instance.id === id;
            });
            if (!instanceToWrite)
                return console.log(`Instance ${id} not exists`);
            let multiVar = this.writeMultiVar[id - 1];
            multiVar = multiVar.map((item, index) => {
                item = Object.assign(Object.assign({}, item), { Data: dataToWrite[index] });
                return item;
            });
            instanceToWrite.instance.writeBuffer = multiVar;
            try {
                yield instanceToWrite.instance.connectPlc();
                yield instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
            }
            catch (error) {
                console.log(`${(0, get_date_as_string_1.getDateAsString)()}Cannot write to PLC id: ${id}: ${error}`);
            }
        });
        this._instances = this.createConnctions();
    }
    get instances() {
        return this._instances;
    }
}
exports.S7_CreatePlcConnections = S7_CreatePlcConnections;

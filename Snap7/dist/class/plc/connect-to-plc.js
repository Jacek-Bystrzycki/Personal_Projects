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
exports.ConnectToPlc = void 0;
const get_date_as_string_1 = require("../../utils/get-date-as-string");
const data_plc_1 = require("./data-plc");
class ConnectToPlc {
    constructor(ip, rack, slot, reconnectInt, s7client) {
        this.ip = ip;
        this.rack = rack;
        this.slot = slot;
        this.reconnectInt = reconnectInt;
        this.s7client = s7client;
        this.connectPlc = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const isConnected = this.s7client.ConnectTo(this.ip, this.rack, this.slot);
                if (isConnected) {
                    resolve(`${(0, get_date_as_string_1.getDateAsString)()}Connected to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
                }
                else {
                    reject(`${(0, get_date_as_string_1.getDateAsString)()}Lost connection to PLC ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
                }
            });
        });
        this.connectionCheck = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = this.s7client.PlcStatus();
                if (typeof data === 'number' && (data === 4 || data === 8)) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
        this.controlPlcConnection = () => {
            let lostConn = true;
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.connectionCheck();
                    this._connected = true;
                }
                catch (error) {
                    try {
                        const isConnected = yield this.connectPlc();
                        console.log(isConnected);
                        lostConn = true;
                    }
                    catch (error) {
                        if (lostConn)
                            console.log(error);
                        lostConn = false;
                        this._connected = false;
                    }
                }
            }), this.reconnectInt);
        };
        this._id = ++ConnectToPlc.countId;
        this._plcData = new data_plc_1.DataPLC(this.s7client);
        this._connected = false;
        this._writeBuffer = Buffer.from([0]);
    }
    get connected() {
        return this._connected;
    }
    get id() {
        return this._id;
    }
    get plcData() {
        return this._plcData;
    }
    get writeBuffer() {
        return this._writeBuffer;
    }
    set writeBuffer(data) {
        this._writeBuffer = data;
    }
}
exports.ConnectToPlc = ConnectToPlc;
ConnectToPlc.countId = 0;

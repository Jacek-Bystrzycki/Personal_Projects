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
const getDateAsString_1 = require("../utils/getDateAsString");
class ConnectToPlc {
    constructor(ip, rack, slot, plcReconnectInterval, s7client) {
        this.ip = ip;
        this.rack = rack;
        this.slot = slot;
        this.plcReconnectInterval = plcReconnectInterval;
        this.s7client = s7client;
        this.connectPlc = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const isConnected = this.s7client.ConnectTo(this.ip, this.rack, this.slot);
                if (isConnected) {
                    resolve(`${(0, getDateAsString_1.getDateAsString)()}Connected to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
                }
                else {
                    reject(`${(0, getDateAsString_1.getDateAsString)()}Lost connection to PLC ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
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
            let lostConMsg = true;
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.connectionCheck();
                    this.connected = true;
                }
                catch (error) {
                    try {
                        const isConnected = yield this.connectPlc();
                        console.log(isConnected);
                        lostConMsg = true;
                    }
                    catch (error) {
                        if (lostConMsg)
                            console.log(error);
                        lostConMsg = false;
                        this.connected = false;
                    }
                }
            }), this.plcReconnectInterval);
        };
        this.connected = false;
    }
    get isConnected() {
        return this.connected;
    }
}
exports.ConnectToPlc = ConnectToPlc;

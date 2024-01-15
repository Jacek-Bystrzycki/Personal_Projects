"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToPlc = exports.createConnections = void 0;
const conn_params_1 = __importDefault(require("./conn-params"));
const ConnectToPlc_1 = require("../class/ConnectToPlc");
const createConnections = () => {
    return conn_params_1.default.map((plc) => {
        return new ConnectToPlc_1.ConnectToPlc(...plc);
    });
};
exports.createConnections = createConnections;
const connectToPlc = (plcDef) => {
    plcDef.forEach((plc) => plc.controlPlcConnection());
};
exports.connectToPlc = connectToPlc;

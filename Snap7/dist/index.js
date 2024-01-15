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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_plc_connections_1 = require("./class/plc/s7/create-plc-connections");
const conn_params_1 = __importDefault(require("./connections/plc/s7/conn-params"));
const plc = new create_plc_connections_1.CreatePlcConnections(conn_params_1.default);
const newData1 = Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]);
const newData2 = Buffer.from([0xff, 0xc9, 0x00, 0xaf, 0xc7, 0x2e]);
const start = (id, data) => {
    plc.connectToPlc(id);
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        plc.setWriteBuffer(id, data);
        plc.writeData(id, 1, 0, data.byteLength);
        const readData = yield plc.readData(id, 1, 0, data.byteLength);
        if (readData instanceof Buffer)
            console.log(readData);
    }), 3000);
};
start(1, newData1);
start(2, newData2);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plc2Params = exports.plc1Params = void 0;
const snap7 = require("node-snap7");
exports.plc1Params = ['172.16.0.10', 0, 1, 3000, new snap7.S7Client()];
exports.plc2Params = ['172.16.0.11', 0, 1, 3000, new snap7.S7Client()];

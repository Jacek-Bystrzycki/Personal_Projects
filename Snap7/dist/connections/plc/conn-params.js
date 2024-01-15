"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snap7 = require("node-snap7");
const plc1 = ['172.16.0.10', 0, 1, 3000, new snap7.S7Client()];
const plc2 = ['172.16.0.11', 0, 1, 3000, new snap7.S7Client()];
const plcDefinitions = [plc1, plc2];
exports.default = plcDefinitions;

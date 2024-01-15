"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snap7 = require("node-snap7");
const plc1Def = ['172.16.0.10', 0, 1, 3000, new snap7.S7Client()];
const plc2Def = ['172.16.0.11', 0, 1, 3000, new snap7.S7Client()];
const plcDef = [plc1Def, plc2Def];
exports.default = plcDef;

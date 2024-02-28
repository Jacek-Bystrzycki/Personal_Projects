"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTU_Defintion = void 0;
class RTU_Defintion {
    constructor(portName, definitions) {
        this.portName = portName;
        this.definitions = definitions;
        const uId = this.definitions.map((def) => def.uId);
        const tags = this.definitions.map((def) => def.tags);
        this._device = [this.portName, uId, tags];
    }
    get device() {
        return this._device;
    }
}
exports.RTU_Defintion = RTU_Defintion;

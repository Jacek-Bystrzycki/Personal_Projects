"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UA_Definition = void 0;
class UA_Definition {
    constructor(endpointUrl, tags) {
        this.endpointUrl = endpointUrl;
        this.tags = tags;
        this._device = [this.endpointUrl, this.tags];
    }
    get device() {
        return this._device;
    }
}
exports.UA_Definition = UA_Definition;

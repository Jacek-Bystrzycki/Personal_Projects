"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MB_Defintion = void 0;
class MB_Defintion {
    constructor(options, uId, tags) {
        this.options = options;
        this.uId = uId;
        this.tags = tags;
        this._device = [this.options, this.uId, this.tags];
    }
    get device() {
        return this._device;
    }
}
exports.MB_Defintion = MB_Defintion;

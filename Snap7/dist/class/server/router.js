"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomRouter = void 0;
const express_1 = require("express");
class CustomRouter {
    constructor() {
        this.addMethod = (type, path, controller) => {
            switch (type) {
                case 'GET':
                    this._router.get(path, controller);
                    break;
                case 'POST':
                    this._router.post(path, controller);
                    break;
                case 'PATCH':
                    this._router.patch(path, controller);
                    break;
                case 'PUT':
                    this._router.put(path, controller);
                    break;
                case 'DELETE':
                    this._router.delete(path, controller);
                    break;
            }
        };
        this._router = (0, express_1.Router)();
    }
    get router() {
        return this._router;
    }
}
exports.CustomRouter = CustomRouter;

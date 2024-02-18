"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomRouter = void 0;
const express_1 = require("express");
class CustomRouter {
    constructor() {
        this.addMiddleware = (type, path, middleware) => {
            switch (type) {
                case 'GET':
                    this._router.get(path, middleware);
                    break;
                case 'POST':
                    this._router.post(path, middleware);
                    break;
                case 'PATCH':
                    this._router.patch(path, middleware);
                    break;
                case 'PUT':
                    this._router.put(path, middleware);
                    break;
                case 'DELETE':
                    this._router.delete(path, middleware);
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

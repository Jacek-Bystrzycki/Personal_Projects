"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = exports.mainPaths = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mainPaths = {
    S7: '/api/v1/s7',
    MB: '/api/v1/mb',
};
exports.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

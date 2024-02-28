"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = exports.mainPaths = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mainPaths = {
    AllTags: '/api/v1/tags/read',
    S7Tags: '/api/v1/tags/s7',
    MBTags: '/api/v1/tags/mb',
    RTUTags: '/api/v1/tags/rtu',
};
exports.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

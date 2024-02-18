"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const get_date_as_string_1 = require("../../utils/get-date-as-string");
const morgan = require("morgan");
class StandardServer {
    constructor(port) {
        this.port = port;
        this.devices = {};
        this.configServer = () => {
            const corsOptions = {
                origin: `http://localhost:${this.port}`,
            };
            this.app.use((0, cors_1.default)(corsOptions));
            this.app.use(express_1.default.json());
            this.app.use((req, res, next) => {
                req.port = this.port.toString();
                next();
            });
            morgan.token('port', (req) => {
                return req.port;
            });
            this.app.use(morgan('Port :port :method :url Status :status - :response-time ms'));
            this.app.use((req, res, next) => {
                req.id = [];
                req.tags = [];
                req.data = [];
                next();
            });
        };
        this.startServer = () => {
            this.app
                .listen(this.port, () => {
                console.log(`${(0, get_date_as_string_1.getDateAsString)()}Server is listening on port ${this.port}...`);
            })
                .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`${(0, get_date_as_string_1.getDateAsString)()}Error: address already in use`);
                }
                else {
                    console.log(`${(0, get_date_as_string_1.getDateAsString)()}${err}`);
                }
            });
        };
        this.app = (0, express_1.default)();
    }
}
exports.StandardServer = StandardServer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomServer = void 0;
const standard_server_1 = require("./standard-server");
const conn_params_1 = require("../../connections/server/conn-params");
const router_1 = require("./router");
const universal_1 = require("./controller/universal");
const s7_1 = require("./controller/s7");
const mb_1 = require("./controller/mb");
const rtu_1 = require("./controller/rtu");
const ua_1 = require("./controller/ua");
const error_handler_1 = require("./error-handler");
const sendResponse_1 = require("./controller/sendResponse");
class CustomServer extends standard_server_1.StandardServer {
    constructor(port, devices) {
        super(port);
        this.port = port;
        this.devices = devices;
        this.configUniversalRoutes = () => {
            if (this.devices.s7_definitions || this.devices.mb_definitions || this.devices.rtu_definitions || this.devices.ua_definitions) {
                this.universal_router = new router_1.CustomRouter();
                this.universal_controller = new universal_1.Universal_Controller(this.devices);
                this.universal_router.addMiddleware('GET', '/', [this.universal_controller.readAll, sendResponse_1.sendResponse]);
                this.app.use(conn_params_1.mainPaths.AllTags, this.universal_router.router);
            }
        };
        this.configS7Routes = () => {
            if (this.devices.s7_definitions) {
                this.s7_router = new router_1.CustomRouter();
                this.s7_controller = new s7_1.S7_Controller(this.devices.s7_definitions);
                this.s7_router.addMiddleware('GET', '/read', [this.s7_controller.verifyS7Params, this.s7_controller.read, sendResponse_1.sendResponse]);
                this.s7_router.addMiddleware('GET', '/read/:id', [this.s7_controller.verifyS7Params, this.s7_controller.read, sendResponse_1.sendResponse]);
                this.s7_router.addMiddleware('PUT', '/write/:id', [this.s7_controller.verifyS7Params, this.s7_controller.verifyS7Payload, this.s7_controller.write]);
                this.s7_router.addMiddleware('PUT', '/writesync/:id', [
                    this.s7_controller.verifyS7Params,
                    this.s7_controller.verifyS7Payload,
                    this.s7_controller.writeSync,
                ]);
                this.app.use(conn_params_1.mainPaths.S7Tags, this.s7_router.router);
            }
        };
        this.configMBRoutes = () => {
            if (this.devices.mb_definitions) {
                this.mb_router = new router_1.CustomRouter();
                this.mb_controller = new mb_1.MB_Controller(this.devices.mb_definitions);
                this.mb_router.addMiddleware('GET', '/read', [this.mb_controller.verifyMBParams, this.mb_controller.read, sendResponse_1.sendResponse]);
                this.mb_router.addMiddleware('GET', '/read/:id', [this.mb_controller.verifyMBParams, this.mb_controller.read, sendResponse_1.sendResponse]);
                this.mb_router.addMiddleware('PUT', '/write/:id', [this.mb_controller.verifyMBParams, this.mb_controller.verifyMBPayload, this.mb_controller.write]);
                this.mb_router.addMiddleware('PUT', '/writesync/:id', [
                    this.mb_controller.verifyMBParams,
                    this.mb_controller.verifyMBPayload,
                    this.mb_controller.writeSync,
                ]);
                this.app.use(conn_params_1.mainPaths.MBTags, this.mb_router.router);
            }
        };
        this.configRTURoutes = () => {
            if (this.devices.rtu_definitions) {
                this.rtu_router = new router_1.CustomRouter();
                this.rtu_controller = new rtu_1.RTU_Controller(this.devices.rtu_definitions);
                this.rtu_router.addMiddleware('GET', '/read', [this.rtu_controller.verifyRTUParams, this.rtu_controller.read, sendResponse_1.sendResponse]);
                this.rtu_router.addMiddleware('GET', '/read/:id', [this.rtu_controller.verifyRTUParams, this.rtu_controller.read, sendResponse_1.sendResponse]);
                this.rtu_router.addMiddleware('PUT', '/write/:id', [this.rtu_controller.verifyRTUParams, this.rtu_controller.verifyPayload, this.rtu_controller.write]);
                this.rtu_router.addMiddleware('PUT', '/writesync/:id', [
                    this.rtu_controller.verifyRTUParams,
                    this.rtu_controller.verifyPayload,
                    this.rtu_controller.writeSync,
                ]);
                this.app.use(conn_params_1.mainPaths.RTUTags, this.rtu_router.router);
            }
        };
        this.configUARoutes = () => {
            if (this.devices.ua_definitions) {
                this.ua_router = new router_1.CustomRouter();
                this.ua_controller = new ua_1.UA_Controller(this.devices.ua_definitions);
                this.ua_router.addMiddleware('GET', '/read', [this.ua_controller.verifyUAParams, this.ua_controller.read, sendResponse_1.sendResponse]);
                this.ua_router.addMiddleware('GET', '/read/:id', [this.ua_controller.verifyUAParams, this.ua_controller.read, sendResponse_1.sendResponse]);
                this.ua_router.addMiddleware('PUT', '/write/:id', [this.ua_controller.verifyUAParams, this.ua_controller.verifyUAPayload, this.ua_controller.write]);
                this.ua_router.addMiddleware('PUT', '/writesync/:id', [
                    this.ua_controller.verifyUAParams,
                    this.ua_controller.verifyUAPayload,
                    this.ua_controller.writeSync,
                ]);
                this.app.use(conn_params_1.mainPaths.OPCUA, this.ua_router.router);
            }
        };
        this.errorHandling = () => {
            this.app.use(error_handler_1.notFound);
            this.app.use(error_handler_1.ErrorHandler.errorHandler);
        };
        this.configServer();
        this.configUniversalRoutes();
        this.configS7Routes();
        this.configMBRoutes();
        this.configRTURoutes();
        this.configUARoutes();
        this.errorHandling();
        this.startServer();
    }
}
exports.CustomServer = CustomServer;

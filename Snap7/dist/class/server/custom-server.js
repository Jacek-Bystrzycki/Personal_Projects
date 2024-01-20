"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomServer = void 0;
const standard_server_1 = require("./standard-server");
const conn_params_1 = require("../../connections/server/conn-params");
const router_1 = require("./router");
const controller_1 = require("./controller");
const error_handler_1 = require("./error-handler");
class CustomServer extends standard_server_1.StandardServer {
    constructor(port, devices) {
        super(port);
        this.port = port;
        this.devices = devices;
        this.configS7Routes = () => {
            if (this.devices.s7_definitions) {
                this.s7_router = new router_1.CustomRouter();
                this.s7_controller = new controller_1.S7_Controller(this);
                this.s7_router.addMethod('GET', '/read/:id', this.s7_controller.read);
                this.s7_router.addMethod('PUT', '/write/:id', this.s7_controller.write);
                this.app.use(conn_params_1.mainPaths.S7, this.s7_router.router);
            }
        };
        this.configMBRoutes = () => {
            if (this.devices.mb_definitions) {
                this.mb_router = new router_1.CustomRouter();
                this.mb_controller = new controller_1.MB_Controller(this);
                this.mb_router.addMethod('GET', '/read/:id', this.mb_controller.read);
                this.mb_router.addMethod('PUT', '/write/:id', this.mb_controller.write);
                this.app.use(conn_params_1.mainPaths.MB, this.mb_router.router);
            }
        };
        this.errorHandling = () => {
            this.app.use(error_handler_1.notFound);
            this.app.use(error_handler_1.ErrorHandler.errorHandler);
        };
        this.configServer();
        this.configS7Routes();
        this.configMBRoutes();
        this.errorHandling();
        this.startServer();
    }
}
exports.CustomServer = CustomServer;

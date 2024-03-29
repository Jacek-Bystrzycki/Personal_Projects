import { StandardServer } from './standard-server';
import { ServerDevices } from '../../types/server/server-types';
import { mainPaths } from '../../connections/server/conn-params';
import { CustomRouter } from './router';
import { Universal_Controller } from './controller/universal';
import { S7_Controller } from './controller/s7';
import { MB_Controller } from './controller/mb';
import { RTU_Controller } from './controller/rtu';
import { UA_Controller } from './controller/ua';
import { ErrorHandler, notFound } from './error-handler';
import { sendResponse } from './controller/sendResponse';

export class CustomServer extends StandardServer {
  private s7_router?: CustomRouter;
  private mb_router?: CustomRouter;
  private rtu_router?: CustomRouter;
  private ua_router?: CustomRouter;
  private universal_router?: CustomRouter;
  private s7_controller?: S7_Controller;
  private mb_controller?: MB_Controller;
  private rtu_controller?: RTU_Controller;
  private ua_controller?: UA_Controller;
  private universal_controller?: Universal_Controller;
  constructor(public port: number, public devices: ServerDevices) {
    super(port);
    this.configServer();
    this.configUniversalRoutes();
    this.configS7Routes();
    this.configMBRoutes();
    this.configRTURoutes();
    this.configUARoutes();
    this.errorHandling();
    this.startServer();
  }

  private configUniversalRoutes = () => {
    if (this.devices.s7_definitions || this.devices.mb_definitions || this.devices.rtu_definitions || this.devices.ua_definitions) {
      this.universal_router = new CustomRouter();
      this.universal_controller = new Universal_Controller(this.devices);
      this.universal_router.addMiddleware('GET', '/', [this.universal_controller.readAll, sendResponse]);
      this.app.use(mainPaths.AllTags, this.universal_router.router);
    }
  };

  private configS7Routes = () => {
    if (this.devices.s7_definitions) {
      this.s7_router = new CustomRouter();
      this.s7_controller = new S7_Controller(this.devices.s7_definitions);
      this.s7_router.addMiddleware('GET', '/read', [this.s7_controller.verifyS7Params, this.s7_controller.read, sendResponse]);
      this.s7_router.addMiddleware('GET', '/read/:id', [this.s7_controller.verifyS7Params, this.s7_controller.read, sendResponse]);
      this.s7_router.addMiddleware('PUT', '/write/:id', [this.s7_controller.verifyS7Params, this.s7_controller.verifyS7Payload, this.s7_controller.write]);
      this.s7_router.addMiddleware('PUT', '/writesync/:id', [
        this.s7_controller.verifyS7Params,
        this.s7_controller.verifyS7Payload,
        this.s7_controller.writeSync,
      ]);

      this.app.use(mainPaths.S7Tags, this.s7_router.router);
    }
  };
  private configMBRoutes = () => {
    if (this.devices.mb_definitions) {
      this.mb_router = new CustomRouter();
      this.mb_controller = new MB_Controller(this.devices.mb_definitions);

      this.mb_router.addMiddleware('GET', '/read', [this.mb_controller.verifyMBParams, this.mb_controller.read, sendResponse]);
      this.mb_router.addMiddleware('GET', '/read/:id', [this.mb_controller.verifyMBParams, this.mb_controller.read, sendResponse]);
      this.mb_router.addMiddleware('PUT', '/write/:id', [this.mb_controller.verifyMBParams, this.mb_controller.verifyMBPayload, this.mb_controller.write]);
      this.mb_router.addMiddleware('PUT', '/writesync/:id', [
        this.mb_controller.verifyMBParams,
        this.mb_controller.verifyMBPayload,
        this.mb_controller.writeSync,
      ]);

      this.app.use(mainPaths.MBTags, this.mb_router.router);
    }
  };
  private configRTURoutes = () => {
    if (this.devices.rtu_definitions) {
      this.rtu_router = new CustomRouter();
      this.rtu_controller = new RTU_Controller(this.devices.rtu_definitions);
      this.rtu_router.addMiddleware('GET', '/read', [this.rtu_controller.verifyRTUParams, this.rtu_controller.read, sendResponse]);
      this.rtu_router.addMiddleware('GET', '/read/:id', [this.rtu_controller.verifyRTUParams, this.rtu_controller.read, sendResponse]);
      this.rtu_router.addMiddleware('PUT', '/write/:id', [this.rtu_controller.verifyRTUParams, this.rtu_controller.verifyPayload, this.rtu_controller.write]);
      this.rtu_router.addMiddleware('PUT', '/writesync/:id', [
        this.rtu_controller.verifyRTUParams,
        this.rtu_controller.verifyPayload,
        this.rtu_controller.writeSync,
      ]);

      this.app.use(mainPaths.RTUTags, this.rtu_router.router);
    }
  };
  private configUARoutes = () => {
    if (this.devices.ua_definitions) {
      this.ua_router = new CustomRouter();
      this.ua_controller = new UA_Controller(this.devices.ua_definitions);
      this.ua_router.addMiddleware('GET', '/read', [this.ua_controller.verifyUAParams, this.ua_controller.read, sendResponse]);
      this.ua_router.addMiddleware('GET', '/read/:id', [this.ua_controller.verifyUAParams, this.ua_controller.read, sendResponse]);
      this.ua_router.addMiddleware('PUT', '/write/:id', [this.ua_controller.verifyUAParams, this.ua_controller.verifyUAPayload, this.ua_controller.write]);
      this.ua_router.addMiddleware('PUT', '/writesync/:id', [
        this.ua_controller.verifyUAParams,
        this.ua_controller.verifyUAPayload,
        this.ua_controller.writeSync,
      ]);

      this.app.use(mainPaths.OPCUA, this.ua_router.router);
    }
  };
  private errorHandling = () => {
    this.app.use(notFound);
    this.app.use(ErrorHandler.errorHandler);
  };
}

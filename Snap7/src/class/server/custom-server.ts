import { StandardServer } from './standard-server';
import { ServerDevices } from '../../types/server/server-types';
import { mainPaths } from '../../connections/server/conn-params';
import { CustomRouter } from './router';
import { S7_Controller, MB_Controller } from './controller';
import { ErrorHandler, notFound } from './error-handler';

export class CustomServer extends StandardServer {
  private s7_router?: CustomRouter;
  private mb_router?: CustomRouter;
  private s7_controller?: S7_Controller;
  private mb_controller?: MB_Controller;
  constructor(public port: number, public devices: ServerDevices) {
    super(port);
    this.configServer();
    this.configS7Routes();
    this.configMBRoutes();
    this.errorHandling();
    this.startServer();
  }

  private configS7Routes = () => {
    if (this.devices.s7_definitions) {
      this.s7_router = new CustomRouter();
      this.s7_controller = new S7_Controller(this);
      this.s7_router.addMethod('GET', '/read/:id', this.s7_controller.read);
      this.s7_router.addMethod('PUT', '/write/:id', this.s7_controller.write);
      this.app.use(mainPaths.S7, this.s7_router.router);
    }
  };
  private configMBRoutes = () => {
    if (this.devices.mb_definitions) {
      this.mb_router = new CustomRouter();
      this.mb_controller = new MB_Controller(this);
      this.mb_router.addMethod('GET', '/read/:id', this.mb_controller.read);
      this.mb_router.addMethod('PUT', '/write/:id', this.mb_controller.write);
      this.app.use(mainPaths.MB, this.mb_router.router);
    }
  };
  private errorHandling = () => {
    this.app.use(notFound);
    this.app.use(ErrorHandler.errorHandler);
  };
}
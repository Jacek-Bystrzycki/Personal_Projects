import { StandardServer } from './standard-server';
import { port, mainPaths } from '../../connections/server/conn-params';
import { CustomRouter } from './router';
import { S7_Controller, MB_Controller } from './controller';
import { ErrorHandler, notFound } from './error-handler';

export class CustomServer extends StandardServer {
  static server = new CustomServer(port);
  private s7_router: CustomRouter = new CustomRouter();
  private mb_router: CustomRouter = new CustomRouter();
  private s7_controller: S7_Controller = new S7_Controller();
  private mb_controller: MB_Controller = new MB_Controller();
  private constructor(port: number) {
    super(port);
    this.configServer();
    this.configS7Routes();
    this.configMBRoutes();
    this.errorHandling();
    this.startServer();
  }

  private errorHandling = () => {
    this.app.use(notFound);
    this.app.use(ErrorHandler.errorHandler);
  };

  private configS7Routes = () => {
    this.s7_router.addMethod('GET', '/read/:id', this.s7_controller.read);
    this.s7_router.addMethod('PUT', '/write/:id', this.s7_controller.write);
    this.app.use(mainPaths.S7, this.s7_router.router);
  };
  private configMBRoutes = () => {
    this.mb_router.addMethod('GET', '/read/:id', this.mb_controller.read);
    this.mb_router.addMethod('PUT', '/write/:id', this.mb_controller.write);
    this.app.use(mainPaths.MB, this.mb_router.router);
  };
}

import { Router, Request, Response, NextFunction } from 'express';
import { RequestTypes, PathType } from '../../connections/server/conn-params';

export class CustomRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
  }

  public addMiddleware = (type: RequestTypes, path: PathType, middleware: ((req: Request, res: Response, next: NextFunction) => void)[]): void => {
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

  public get router(): Router {
    return this._router;
  }
}

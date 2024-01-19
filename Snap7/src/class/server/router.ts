import { Router, Request, Response, NextFunction } from 'express';
import { RequestTypes, PathType } from '../../connections/server/conn-params';

export class CustomRouter {
  private _router: Router;
  constructor() {
    this._router = Router();
  }

  public addMethod = (type: RequestTypes, path: PathType, controller: (req: Request, res: Response, next: NextFunction) => Promise<void>): void => {
    switch (type) {
      case 'GET':
        this._router.get(path, controller);
        break;
      case 'POST':
        this._router.post(path, controller);
        break;
      case 'PATCH':
        this._router.patch(path, controller);
        break;
      case 'PUT':
        this._router.put(path, controller);
        break;
      case 'DELETE':
        this._router.delete(path, controller);
        break;
    }
  };

  public get router(): Router {
    return this._router;
  }
}

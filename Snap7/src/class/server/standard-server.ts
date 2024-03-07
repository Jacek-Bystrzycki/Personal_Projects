import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import { ServerDevices, ServerType } from '../../types/server/server-types';
import { getDateAsString } from '../../utils/get-date-as-string';
import { Request, Response, NextFunction } from 'express';
import morgan = require('morgan');
import { IncomingMessage } from 'http';
import type { S7_AfterFormatRead } from '../../types/plc/s7/request';
import type { MB_AfterFormatRead } from '../../types/plc/mb/request';
import { UA_ReadFormat } from '../../types/plc/ua/request';

declare global {
  namespace Express {
    interface Request {
      id: number[];
      tags: number[][];
      port: string;
      data: number[][];
    }
    interface Response {
      s7Tags: S7_AfterFormatRead[];
      mbTags: MB_AfterFormatRead[];
      rtuTags: MB_AfterFormatRead[];
      uaTags: UA_ReadFormat[];
    }
  }
}

interface RequestForMorgan extends IncomingMessage {
  port: string;
}

export class StandardServer implements ServerType {
  public readonly app: Express;
  public devices: ServerDevices = {};
  constructor(protected readonly port: number) {
    this.app = express();
  }

  protected configServer = () => {
    const corsOptions: CorsOptions = {
      origin: `http://localhost:${this.port}`,
    };
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.port = this.port.toString();
      next();
    });
    morgan.token('port', (req: RequestForMorgan) => {
      return req.port;
    });

    this.app.use(morgan('Port :port :method :url Status :status - :response-time ms'));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = [];
      req.tags = [];
      req.data = [];
      next();
    });
  };

  protected startServer = () => {
    this.app
      .listen(this.port, () => {
        console.log(`${getDateAsString()}Server is listening on port ${this.port}...`);
      })
      .on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`${getDateAsString()}Error: address already in use`);
        } else {
          console.log(`${getDateAsString()}${err}`);
        }
      });
  };
}

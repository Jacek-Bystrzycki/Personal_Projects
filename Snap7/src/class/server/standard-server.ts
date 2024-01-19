import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import { ServerType } from '../../types/server/server-types';
import { getDateAsString } from '../../utils/get-date-as-string';
import morgan from 'morgan';

export class StandardServer implements ServerType {
  public readonly app: Express;
  constructor(protected readonly port: number) {
    this.app = express();
  }

  protected configServer = () => {
    const corsOptions: CorsOptions = {
      origin: `http://localhost:${this.port}`,
    };
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(morgan('tiny'));
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

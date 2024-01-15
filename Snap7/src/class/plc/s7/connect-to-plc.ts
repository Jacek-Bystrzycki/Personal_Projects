import snap7 = require('node-snap7');
import { getDateAsString } from '../../../utils/get-date-as-string';
import { DataPLC } from './data-plc';

export class ConnectToPlc extends DataPLC {
  static countId: number = 0;
  private _id: number;
  private _connected: boolean;
  private _writeBuffer: Buffer;
  constructor(
    public readonly ip: string,
    public readonly rack: number,
    public readonly slot: number,
    public readonly reconnectInt: number,
    protected readonly s7client: snap7.S7Client
  ) {
    super(s7client);
    this._id = ++ConnectToPlc.countId;
    this._connected = false;
    this._writeBuffer = Buffer.from([0]);
  }

  private connectPlc = async (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const isConnected: boolean = this.s7client.ConnectTo(this.ip, this.rack, this.slot);
      if (isConnected) {
        resolve(`${getDateAsString()}Connected to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
      } else {
        reject(`${getDateAsString()}Lost connection to PLC ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
      }
    });
  };

  private connectionCheck = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const data: unknown = this.s7client.PlcStatus();
      if (typeof data === 'number' && (data === 4 || data === 8)) {
        resolve();
      } else {
        reject();
      }
    });
  };

  public controlPlcConnection = (): void => {
    let lostConn: boolean = true;
    setInterval(async (): Promise<void> => {
      try {
        await this.connectionCheck();
        this._connected = true;
      } catch (error) {
        try {
          const isConnected = await this.connectPlc();
          console.log(isConnected);
          lostConn = true;
        } catch (error) {
          if (lostConn) console.log(error);
          lostConn = false;
          this._connected = false;
        }
      }
    }, this.reconnectInt);
  };

  public get connected(): boolean {
    return this._connected;
  }

  public get id(): number {
    return this._id;
  }

  public get writeBuffer(): Buffer {
    return this._writeBuffer;
  }

  public set writeBuffer(data: Buffer) {
    this._writeBuffer = data;
  }
}

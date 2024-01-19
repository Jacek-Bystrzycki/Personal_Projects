import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { InternalError } from '../../../types/server/errors';

export class S7_ConnectToPlc extends S7_DataPLC {
  static countId: number = 0;
  private _id: number;
  private _readBuffer: snap7.MultiVarRead[];
  private _writeBuffer: snap7.MultiVarWrite[];
  constructor(public readonly ip: string, public readonly rack: number, public readonly slot: number) {
    super();
    this._id = ++S7_ConnectToPlc.countId;
    this._readBuffer = [];
    this._writeBuffer = [];
  }

  public s7_connectPlc = async (): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      this.s7client.Disconnect();
      this.s7client.ConnectTo(this.ip, this.rack, this.slot, (err) => {
        if (!err) {
          resolve();
        } else {
          reject(new InternalError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
        }
      });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        this.s7client.Disconnect();
        reject(new InternalError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
      }, s7_triggetTime / 6);
    });
    return Promise.race([promise, timeout]);
  };

  public get id(): number {
    return this._id;
  }

  public get readBuffer(): snap7.MultiVarRead[] {
    return this._readBuffer;
  }

  public set readBuffer(data: snap7.MultiVarRead[]) {
    this._readBuffer = data;
  }

  public get writeBuffer(): snap7.MultiVarWrite[] {
    return this._writeBuffer;
  }

  public set writeBuffer(data: snap7.MultiVarWrite[]) {
    this._writeBuffer = data;
  }
}

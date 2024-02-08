import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { CustomError } from '../../../types/server/errors';
import { ReadBuffer, WriteBuffer } from '../../../types/plc/s7/buffers';

export class S7_ConnectToPlc extends S7_DataPLC {
  private _readBuffer: ReadBuffer[];
  private _writeBuffer: WriteBuffer[];
  public lastErrorMsg: string = '';
  public isError: boolean = true;
  constructor(
    public readonly ip: string,
    public readonly rack: number,
    public readonly slot: number,
    public readData: snap7.MultiVarRead[],
    public writeData: snap7.MultiVarWrite[]
  ) {
    super();
    this._readBuffer = readData.map((params) => {
      return { params, data: Buffer.from('0') };
    });
    this._writeBuffer = writeData.map((params) => {
      return { params, execute: false };
    });
    this.loop();
  }

  private s7_connectPlc = async (): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      this.s7client.Disconnect();
      this.s7client.ConnectTo(this.ip, this.rack, this.slot, (err) => {
        if (!err) {
          resolve();
        } else {
          reject(new CustomError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
        }
      });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        this.s7client.Disconnect();
        reject(new CustomError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
      }, s7_triggetTime / 1.5);
    });
    return Promise.race([promise, timeout]);
  };

  private loop = (): void => {
    const readParams: snap7.MultiVarRead[] = this._readBuffer.map((param) => {
      return param.params;
    });
    setInterval(async () => {
      try {
        await this.s7_connectPlc();
        const data: snap7.MultiVarsReadResult[] = await this.s7_readFromPlc(readParams);
        data.forEach((result, index) => {
          this._readBuffer[index].data = result.Data;
        });
        const writeData: snap7.MultiVarWrite[] = this._writeBuffer
          .filter((data) => data.execute)
          .map((data) => {
            return data.params;
          });
        if (writeData.length > 0) {
          await this.s7_writeToPlc(writeData);
          this._writeBuffer.forEach((data) => (data.execute = false));
        }
        this.isError = false;
      } catch (error) {
        if (error instanceof CustomError) this.lastErrorMsg = error.message;
        this.isError = true;
      }
    }, s7_triggetTime);
  };

  public get readBuffer(): ReadBuffer[] {
    return this._readBuffer;
  }

  public set readBuffer(data: ReadBuffer[]) {
    this._readBuffer = data;
  }

  public get writeBuffer(): WriteBuffer[] {
    return this._writeBuffer;
  }

  public set writeBuffer(data: WriteBuffer[]) {
    this._writeBuffer = data;
  }
}

import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { CustomError } from '../../../types/server/errors';
import { S7_ReadBuffer, S7_WriteBuffer } from '../../../types/plc/s7/buffers';
import { setIntervalAsync } from 'set-interval-async/fixed';
import type { S7_ReadTagDef, S7_WriteTagDef } from '../../../types/plc/s7/format';

export class S7_ConnectToPlc extends S7_DataPLC {
  private _readBuffer: S7_ReadBuffer[];
  private _writeBuffer: S7_WriteBuffer[];
  public lastErrorMsg: string = '';
  public isError: boolean = true;
  constructor(
    public readonly ip: string,
    public readonly rack: number,
    public readonly slot: number,
    public readData: S7_ReadTagDef[],
    public writeData: S7_WriteTagDef[]
  ) {
    super();
    this._readBuffer = readData.map((def) => {
      return { params: def.params, format: def.format, data: Buffer.from('0') };
    });
    this._writeBuffer = writeData.map((def) => {
      return { params: def.params, format: def.format, execute: false };
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
    setIntervalAsync(async () => {
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

  public get readBuffer(): S7_ReadBuffer[] {
    return this._readBuffer;
  }

  public set readBuffer(data: S7_ReadBuffer[]) {
    this._readBuffer = data;
  }

  public get writeBuffer(): S7_WriteBuffer[] {
    return this._writeBuffer;
  }

  public set writeBuffer(data: S7_WriteBuffer[]) {
    this._writeBuffer = data;
  }
}

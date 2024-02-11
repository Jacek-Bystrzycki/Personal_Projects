import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { CustomError, InternalError } from '../../../types/server/errors';
import { S7_ReadBuffer, S7_WriteBuffer } from '../../../types/plc/s7/buffers';
import { setIntervalAsync } from 'set-interval-async/fixed';
import type { S7_ReadTagDef, S7_WriteTagDef } from '../../../types/plc/s7/format';
import { waitUntil } from '../../../utils/waitUntil';

export class S7_ConnectToPlc extends S7_DataPLC {
  private _readBuffer: S7_ReadBuffer[];
  private _writeBuffer: S7_WriteBuffer[];
  private _isSyncBusy: boolean = false;
  constructor(
    public readonly ip: string,
    public readonly rack: number,
    public readonly slot: number,
    public readData: S7_ReadTagDef[],
    public writeData: S7_WriteTagDef[]
  ) {
    super();
    this._readBuffer = readData.map((def) => {
      return { params: def.params, format: def.format, data: Buffer.from([0]), isError: true, status: 'Init Error' };
    });
    this._writeBuffer = writeData.map((def) => {
      return { params: def.params, format: def.format, execute: false, isError: false, status: 'No write command triggered yet' };
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
        readParams.forEach(async (param, index) => {
          try {
            const data: snap7.MultiVarsReadResult[] = await this.s7_readFromPlc([param]);
            this._readBuffer[index].data = data[0].Data;
            this._readBuffer[index].isError = false;
            this._readBuffer[index].status = 'OK';
          } catch (error) {
            this._readBuffer[index].data = Buffer.from([0]);
            this._readBuffer[index].isError = true;
            if (error instanceof CustomError) {
              this._readBuffer[index].status = error.message;
              this._writeBuffer[index].status = this._readBuffer[index].status;
            } else {
              this._readBuffer[index].status = 'Unknown error';
              this._writeBuffer[index].status = this._readBuffer[index].status;
            }
          }
        });
      } catch (error) {
        this._readBuffer.forEach((data, index) => {
          data.isError = true;
          data.data = Buffer.from([0]);
          if (error instanceof CustomError) {
            data.status = error.message;
            this._writeBuffer[index].status = data.status;
          } else {
            data.status = 'Unknown error';
            this._writeBuffer[index].status = data.status;
          }
        });
      }
      try {
        type WtiteData = {
          data: snap7.MultiVarWrite;
          index: number;
          execute: boolean;
        };
        const writeData: WtiteData[] = this._writeBuffer
          .map((data, index) => {
            return { data: data.params, index, execute: data.execute };
          })
          .filter((data) => data.execute);
        writeData.forEach(async (data) => {
          if (!this._readBuffer[data.index].isError) {
            await this.s7_writeToPlc([data.data]);
            this._writeBuffer[data.index].execute = false;
            this._writeBuffer[data.index].isError = false;
            this._writeBuffer[data.index].status = 'Done';
          } else {
            this._writeBuffer[data.index].execute = false;
            this._writeBuffer[data.index].isError = true;
          }
        });
      } catch (error) {
        this._writeBuffer.forEach((data) => {
          data.isError = true;
          data.execute = false;
          if (error instanceof CustomError) data.status = error.message;
          else data.status = 'Unknown error';
        });
      } finally {
        this._isSyncBusy = false;
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

  public set isSyncBusy(data: boolean) {
    this._isSyncBusy = data;
  }

  public get isSyncBusy(): boolean {
    return this._isSyncBusy;
  }
}

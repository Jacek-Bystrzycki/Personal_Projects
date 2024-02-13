import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { CustomError } from '../../../types/server/errors';
import { S7_ReadTag, S7_WriteTag } from '../../../types/plc/s7/tags';
import { setIntervalAsync } from 'set-interval-async/fixed';
import type { S7_ReadTagDef, S7_WriteTagDef } from '../../../types/plc/s7/format';
import { SyncQuery } from '../../../types/plc/s7/syncQuery';

export class S7_ConnectToPlc extends S7_DataPLC {
  private _readBuffer: S7_ReadTag[];
  private _writeBuffer: S7_WriteTag[];
  private _readBufferConsistent: S7_ReadTag[];
  private _writeBufferConsistent: S7_WriteTag[];
  private _writeBufferSync: S7_WriteTag[];
  private _syncQueue: SyncQuery[] = [];
  constructor(
    public readonly ip: string,
    public readonly rack: number,
    public readonly slot: number,
    public readData: S7_ReadTagDef[],
    public writeData: S7_WriteTagDef[]
  ) {
    super();
    this._readBuffer = readData.map((def) => {
      return { params: def.params, format: def.format, data: Buffer.from([]), isError: true, status: 'Init Error', id: def.id };
    });
    this._writeBuffer = writeData.map((def) => {
      return { params: def.params, format: def.format, execute: false, isError: false, status: 'No write command triggered yet', id: def.id };
    });
    this._readBufferConsistent = this._readBuffer;
    this._writeBufferConsistent = this._writeBuffer;
    this._writeBufferSync = this._writeBuffer;
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
        //============================ READ ASYNC ===================
        readParams.forEach(async (param, index) => {
          try {
            const data: snap7.MultiVarsReadResult[] = await this.s7_readFromPlc([param]);
            this._readBuffer[index].data = data[0].Data;
            this._readBuffer[index].isError = false;
            this._readBuffer[index].status = 'OK';
          } catch (error) {
            this._readBuffer[index].data = Buffer.from([]);
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
          data.data = Buffer.from([]);
          if (error instanceof CustomError) {
            data.status = error.message;
            this._writeBuffer[index].status = data.status;
          } else {
            data.status = 'Unknown error';
            this._writeBuffer[index].status = data.status;
          }
        });
      }
      this._readBufferConsistent = this._readBuffer;
      //============================ WRITE ASYNC ===================
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
            this._writeBufferConsistent[data.index].execute = false;
            this._writeBuffer[data.index].isError = false;
            this._writeBuffer[data.index].status = 'Done';
          } else {
            this._writeBuffer[data.index].execute = false;
            this._writeBufferConsistent[data.index].execute = false;
            this._writeBuffer[data.index].isError = true;
          }
        });
      } catch (error) {
        this._writeBuffer.forEach((data, index) => {
          data.isError = true;
          data.execute = false;
          this._writeBufferConsistent[index].execute = false;
          if (error instanceof CustomError) data.status = error.message;
          else data.status = 'Unknown error';
        });
        this._writeBuffer = this._writeBuffer.map((data, index) => {
          const params: snap7.MultiVarWrite = { ...data.params, Data: this._writeBufferConsistent[index].params.Data };
          return { ...data, execute: this._writeBufferConsistent[index].execute, params };
        });
      }
      //============================ WRITE SYNC ===================
      this._syncQueue.forEach(async (query) => {
        if (!query.isDone) {
          const dataToWrite: snap7.MultiVarWrite[] = query.indexes.map((index, i) => {
            return { ...this._writeBufferSync[index - 1].params, Data: query.data[i] };
          });
          try {
            await this.s7_writeToPlc(dataToWrite);
            query.isDone = true;
          } catch (error) {
            query.isError = true;
            if (error instanceof CustomError) {
              query.errorMsg = error.message;
            } else query.errorMsg = 'Unknown Error during writing';
          }
        }
      });
    }, s7_triggetTime);
  };

  public addToSyncQueue = (data: SyncQuery): void => {
    this._syncQueue.push(data);
  };

  public removeFromSyncQueue = (id: string): void => {
    this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
  };

  public get readBufferConsistent(): S7_ReadTag[] {
    return this._readBufferConsistent;
  }

  public get writeBufferConsistent(): S7_WriteTag[] {
    return this._writeBufferConsistent;
  }

  public set writeBufferConsistent(data: S7_WriteTag[]) {
    this._writeBufferConsistent = data;
  }

  public get syncQueue(): SyncQuery[] {
    return this._syncQueue;
  }
}

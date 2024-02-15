import snap7 = require('node-snap7');
import { S7_DataPLC } from './data-plc';
import { s7_triggetTime } from '../../../connections/plc/s7/conn-params';
import { InternalError } from '../../../types/server/errors';
import { S7_ReadTag, S7_WriteTag } from '../../../types/plc/s7/tags';
import { setIntervalAsync } from 'set-interval-async/fixed';
import type { S7_ReadTagDef, S7_WriteTagDef } from '../../../types/plc/s7/format';
import { S7_SyncQuery } from '../../../types/plc/s7/syncQuery';

export class S7_ConnectToPlc extends S7_DataPLC {
  private _readBuffer: S7_ReadTag[];
  private _writeBuffer: S7_WriteTag[];
  private _readBufferConsistent: S7_ReadTag[] = [];
  private _writeBufferConsistent: S7_WriteTag[];
  private _writeBufferSync: S7_WriteTag[];
  private _syncQueue: S7_SyncQuery[] = [];
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
    this._readBufferConsistent = structuredClone(this._readBuffer);
    this._writeBufferConsistent = structuredClone(this._writeBuffer);
    this._writeBufferSync = structuredClone(this._writeBuffer);
    this.loop();
  }

  private s7_connectPlc = async (): Promise<void> => {
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
      }, s7_triggetTime / 1.5);
    });
    return Promise.race([promise, timeout]);
  };

  private loop = (): void => {
    setIntervalAsync(async () => {
      try {
        await this.s7_connectPlc();
        //============================ READ ASYNC ===================
        this._readBuffer.forEach(async (tag, index) => {
          try {
            const data: snap7.MultiVarsReadResult[] = await this.s7_readFromPlc([tag.params]);
            tag.data = data[0].Data;
            tag.isError = false;
            tag.status = 'OK';
          } catch (error) {
            tag.data = Buffer.from([]);
            tag.isError = true;
            if (error instanceof InternalError) {
              tag.status = error.message;
              this._writeBufferConsistent[index].status = tag.status;
            } else {
              tag.status = 'Unknown Error';
              this._writeBufferConsistent[index].status = tag.status;
            }
          }
        });
      } catch (error) {
        this._readBuffer.forEach((tag, index) => {
          tag.isError = true;
          tag.data = Buffer.from([]);
          if (error instanceof InternalError) {
            tag.status = error.message;
            this._writeBufferConsistent[index].status = tag.status;
          } else {
            tag.status = 'Unknown error';
            this._writeBufferConsistent[index].status = tag.status;
          }
        });
      }
      this._readBufferConsistent = structuredClone(this._readBuffer);
      //============================ WRITE ASYNC ===================
      this._writeBuffer.forEach(async (tag, index) => {
        if (tag.execute) {
          try {
            if (!this._readBuffer[index].isError) {
              await this.s7_writeToPlc([tag.params]);
              tag.execute = false;
              tag.isError = false;
              tag.status = 'Done';
            } else {
              throw new InternalError(this._readBuffer[index].status);
            }
          } catch (error) {
            tag.execute = false;
            tag.isError = true;
            if (error instanceof InternalError) {
              tag.status = error.message;
            } else tag.status = 'Unknown error';
          }
        }
      });
      this._writeBuffer = this._writeBuffer.map((data, index) => {
        const params: snap7.MultiVarWrite = { ...data.params, Data: this._writeBufferConsistent[index].params.Data };
        const toWriteBufer = { ...data, execute: this._writeBufferConsistent[index].execute ? true : false, params };
        this._writeBufferConsistent[index].execute = false;
        return toWriteBufer;
      });
      //============================ WRITE SYNC ===================
      this._syncQueue.forEach(async (query) => {
        if (!query.isDone && !query.isError) {
          const dataToWrite: snap7.MultiVarWrite[] = query.indexes.map((index, i) => {
            return { ...this._writeBufferSync[index - 1].params, Data: query.data[i] };
          });
          try {
            await this.s7_writeToPlc(dataToWrite);
            query.isDone = true;
          } catch (error) {
            query.isError = true;
            if (error instanceof InternalError) {
              query.errorMsg = error.message;
            } else query.errorMsg = 'Unknown Error during writing';
          }
        }
      });
    }, s7_triggetTime);
  };

  public addToSyncQueue = (data: S7_SyncQuery): void => {
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

  public get syncQueue(): S7_SyncQuery[] {
    return this._syncQueue;
  }
}

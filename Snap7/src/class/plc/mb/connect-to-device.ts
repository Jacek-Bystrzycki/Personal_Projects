import { Socket, SocketConnectOpts } from 'net';
import Modbus = require('jsmodbus');
import { InternalError } from '../../../types/server/errors';
import { setIntervalAsync } from 'set-interval-async/fixed';
import type { MB_TagDef } from '../../../types/plc/mb/format';
import type { MB_ReadTag, MB_WriteTag } from '../../../types/plc/mb/tags';
import type { MB_SyncQuery } from '../../../types/plc/mb/syncQuery';
import type { MB_Params } from '../../../types/plc/mb/format';

export class MB_ConnectToDevice {
  private _socket: Socket;
  private _client: Modbus.ModbusTCPClient;
  private _readBuffer: MB_ReadTag[];
  private _writeBuffer: MB_WriteTag[];
  private _readBufferConsistent: MB_ReadTag[];
  private _writeBufferConsistent: MB_WriteTag[];
  private _syncQueue: MB_SyncQuery[] = [];
  private _isConnected: boolean = false;
  private _connectCmd: boolean = false;
  constructor(private readonly options: SocketConnectOpts, private readonly uId: number, private readonly tagsDefs: MB_TagDef[]) {
    this._socket = new Socket();
    this._client = new Modbus.client.TCP(this._socket, this.uId);
    this._readBuffer = this.tagsDefs.map((tagDef): MB_ReadTag => {
      const { data, ...params } = tagDef.params;
      return { params, id: tagDef.id, format: tagDef.format, data: [], isError: true, status: 'Init Error' };
    });
    this._writeBuffer = this.tagsDefs.map((tagDef): MB_WriteTag => {
      const { count, ...params } = tagDef.params;
      return { params, id: tagDef.id, format: tagDef.format, execute: false, isError: true, status: 'Write not triggered yet' };
    });
    this._readBufferConsistent = structuredClone(this._readBuffer);
    this._writeBufferConsistent = structuredClone(this._writeBuffer);
    this.loop();
  }

  private loop = () => {
    this._socket.on('error', () => {
      this._isConnected = false;
      this._connectCmd = false;
    });
    this._socket.on('close', () => {
      this._isConnected = false;
      this._connectCmd = false;
    });
    this._socket.on('connect', () => {
      this._isConnected = true;
      this._connectCmd = false;
    });

    setIntervalAsync(async () => {
      try {
        if (this._isConnected) {
          //============ READ ASYNC ======================
          for (const [index, tag] of this._readBuffer.entries()) {
            try {
              tag.data = await this.mb_ReadRegisters(tag.params);
              tag.isError = false;
              tag.status = 'OK';
            } catch (error) {
              tag.isError = true;
              tag.data = [];
              if (error instanceof InternalError) {
                tag.status = error.message;
                this._writeBufferConsistent[index].status = tag.status;
              } else {
                tag.status = 'Unknown Error';
                this._writeBufferConsistent[index].status = tag.status;
              }
            }
          }
          //============ WRITE ASYNC ======================
          for (const [index, tag] of this._writeBuffer.entries()) {
            if (tag.execute) {
              try {
                if (!this._readBuffer[index].isError) {
                  await this.mb_WriteRegisters(tag.params);
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
                } else tag.status = 'Unknown Error';
              }
            }
          }
          //============ WRITE SYNC ======================
          for (const query of this._syncQueue) {
            if (!query.isDone && !query.isError) {
              for (const [i, index] of query.tags.entries()) {
                const dataToWrite: Pick<MB_Params, 'area' | 'len' | 'start' | 'data'> = { ...this._writeBuffer[index - 1].params, data: query.data[i] };
                try {
                  await this.mb_WriteRegisters(dataToWrite);
                  query.status = 'Query Done';
                  query.isDone = true;
                } catch (error) {
                  query.isError = true;
                  if (error instanceof InternalError) {
                    query.status = error.message;
                  } else query.status = 'Unknown Error during writing';
                }
              }
            }
          }
          //==============================================
        } else {
          throw new InternalError(`Device offline`);
        }
      } catch (error) {
        if (!this._connectCmd) {
          this._socket.connect(this.options);
          this._connectCmd = true;
        }
        this._readBuffer.forEach((tag, index) => {
          tag.isError = true;
          if (error instanceof InternalError) {
            tag.status = error.message;
            this._writeBufferConsistent[index].status = tag.status;
            tag.data = [];
          } else {
            tag.status = 'Unknown Error';
            this._writeBufferConsistent[index].status = tag.status;
          }
        });
      }
      this._readBufferConsistent = structuredClone(this._readBuffer);
      this._writeBuffer = this._writeBuffer.map((tag, index) => {
        const params = { ...tag.params, data: this._writeBufferConsistent[index].params.data };
        const toWriteBufer: MB_WriteTag = { ...tag, execute: this._writeBufferConsistent[index].execute ? true : false, params };
        this._writeBufferConsistent[index].execute = false;
        return toWriteBufer;
      });
    }, 200);
  };

  public mb_ReadRegisters = async (params: Pick<MB_Params, 'area' | 'len' | 'start' | 'count'>): Promise<number[]> => {
    const { start, count, len } = params;
    const startNo: number = len !== 'Bit' ? start : Math.floor(start / 16);
    const countNo: number = len !== 'Dword' ? count : count * 2;
    const promise = new Promise<number[]>((resolve, reject) => {
      this._client
        .readHoldingRegisters(startNo, countNo)
        .then(({ response }) => {
          resolve(response.body.valuesAsArray as number[]);
        })
        .catch((err) => {
          const error = this.mb_handleErrors(err);
          reject(new InternalError(`${error}`));
        });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new InternalError('Read registers timeout')), 1000);
    });

    return Promise.race([promise, timeout]);
  };

  public mb_WriteRegisters = async (params: Pick<MB_Params, 'area' | 'len' | 'start' | 'data'>): Promise<void> => {
    const { start, data, len } = params;
    const startNo: number = len === 'Bit' ? Math.floor(start / 16) : start;
    const promise = new Promise<void>((resolve, reject) => {
      this._client
        .writeMultipleRegisters(startNo, data)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          const error = this.mb_handleErrors(err);
          reject(new InternalError(`${error}`));
        });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new InternalError('Write registers timeout')), 1000);
    });
    return Promise.race([promise, timeout]);
  };

  private mb_handleErrors = (err: any): string => {
    if (Modbus.errors.isUserRequestError(err)) {
      switch (err.err) {
        case 'OutOfSync':
        case 'Protocol':
        case 'Timeout':
        case 'ManuallyCleared':
        case 'ModbusException':
        case 'Offline':
        case 'crcMismatch':
          return 'Error Message: ' + err.message, 'Error' + 'Modbus Error Type: ' + err.err;
      }
    } else if (Modbus.errors.isInternalException(err)) {
      return `Error Message: '  ${err.message}, 'Error' + 'Error Name: ' ${(err.name, err.stack)}`;
    } else {
      return `Unknown Error, ${err}`;
    }
  };

  public addToSyncQueue = (data: MB_SyncQuery): void => {
    this._syncQueue.push(data);
  };

  public removeFromSyncQueue = (id: string): void => {
    this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
  };

  public get readBufferConsistent(): MB_ReadTag[] {
    return this._readBufferConsistent;
  }

  public get writeBufferConsistent(): MB_WriteTag[] {
    return this._writeBufferConsistent;
  }

  public set writeBufferConsistent(data: MB_WriteTag[]) {
    this._writeBufferConsistent = data;
  }

  public get syncQueue(): MB_SyncQuery[] {
    return this._syncQueue;
  }
}

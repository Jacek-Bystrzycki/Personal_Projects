import { SerialPort, SerialPortOpenOptions } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import Modbus = require('jsmodbus');
import type { MB_TagDef, MB_Params } from '../../../types/plc/mb/format';
import { InternalError } from '../../../types/server/errors';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import type { MB_ReadTag, MB_WriteTag } from '../../../types/plc/mb/tags';
import { sleep } from '../../../utils/sleep';
import type { RTU_ReadBuffer, RTU_WriteBuffer } from '../../../types/plc/rtu/buffers';
import { RTU_SyncQuery } from '../../../types/plc/rtu/syncQuery';

export class RTU_ConnectToDevice {
  private _options: SerialPortOpenOptions<AutoDetectTypes>;
  private _client: Modbus.ModbusRTUClient[] = [];
  private _socket: SerialPort;
  private _isOpened: boolean = false;
  private _readBuffer: RTU_ReadBuffer[] = [];
  private _writeBuffer: RTU_WriteBuffer[] = [];
  private _deviceOK: boolean[] = [];
  private _writeBufferConsistent: RTU_WriteBuffer[] = [];
  private _syncQueue: RTU_SyncQuery[] = [];
  constructor(private readonly portName: string, private readonly uId: number[], private readonly tagsDefs: MB_TagDef[][]) {
    if (uId.length !== tagsDefs.length) throw new Error('Wrong RTU params');
    this._options = {
      path: this.portName ? this.portName : 'COM1',
      baudRate: 9600,
      parity: 'none',
      dataBits: 8,
      stopBits: 1,
      rtscts: false,
      xon: false,
      xoff: false,
      xany: false,
      hupcl: true,
    };
    this._socket = new SerialPort(this._options);
    this.tagsDefs.forEach((device, index) => {
      this._client[index] = new Modbus.client.RTU(this._socket, this.uId[index]);
      const uId: number = this.uId[index];
      const tags: MB_ReadTag[] = device.map((tagDef): MB_ReadTag => {
        const { data, ...params } = tagDef.params;
        return { params, id: tagDef.id, format: tagDef.format, data: [], isError: true, status: 'Init Error' };
      });
      const tempDevice: RTU_ReadBuffer = { uId, tags };
      this._readBuffer.push(tempDevice);

      const writeTag: MB_WriteTag[] = device.map((tagDef): MB_WriteTag => {
        const { count, ...params } = tagDef.params;
        return { params, id: tagDef.id, format: tagDef.format, execute: false, isError: true, status: 'Write not triggered yet' };
      });
      const tempDeviceWrite: RTU_WriteBuffer = { uId, tags: writeTag };
      this._writeBuffer.push(tempDeviceWrite);
    });
    this._writeBufferConsistent = structuredClone(this._writeBuffer);
    this.uId.forEach((_, index) => {
      this._deviceOK[index] = true;
    });
    this.loop();
  }

  private loop = () => {
    this._socket.on('error', () => {
      this._isOpened = false;
    });
    this._socket.on('close', () => {
      this._isOpened = false;
    });
    this._socket.on('open', () => {
      this._isOpened = true;
    });
    // SerialPort.list().then((ports) => ports.forEach((port) => console.log(port.path)));

    setIntervalAsync(async () => {
      if (this._isOpened) {
        //============ READ ASYNC ======================
        for (let i = 0; i < this._readBuffer.length; i++) {
          for (let j = 0; j < this._readBuffer[i].tags.length; j++) {
            if (j === 0) this._deviceOK[i] = true;
            if (this._deviceOK[i]) {
              try {
                this._readBuffer[i].tags[j].data = await this.rtu_ReadRegisters(this._client[i], this._readBuffer[i].tags[j].params);
                this._readBuffer[i].tags[j].isError = false;
                this._readBuffer[i].tags[j].status = 'OK';
              } catch (error) {
                this._deviceOK[i] = false;
                for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                  this._readBuffer[i].tags[y].isError = true;
                  this._readBuffer[i].tags[y].data = [];
                }
                if (error instanceof InternalError) {
                  for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                    this._readBuffer[i].tags[y].status = error.message;
                    this._writeBufferConsistent[i].tags[y].status = error.message;
                  }
                } else {
                  for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                    this._readBuffer[i].tags[y].status = 'Unknown Error';
                    this._writeBufferConsistent[i].tags[y].status = 'Unknown Error';
                  }
                }
              } finally {
                await sleep(80);
              }
            }
          }
        }
        //============ WRITE ASYNC ======================
        for (let i = 0; i < this._writeBuffer.length; i++) {
          for (let j = 0; j < this._writeBuffer[i].tags.length; j++) {
            if (this._writeBuffer[i].tags[j].execute) {
              try {
                if (!this._readBuffer[i].tags[j].isError) {
                  await this.rtu_WriteRegisters(this._client[i], this._writeBuffer[i].tags[j].params);
                  this._writeBuffer[i].tags[j].execute = false;
                  this._writeBuffer[i].tags[j].isError = false;
                  this._writeBuffer[i].tags[j].status = 'Done';
                } else {
                  throw new InternalError(this._readBuffer[i].tags[j].status);
                }
              } catch (error) {
                this._writeBuffer[i].tags[j].execute = false;
                this._writeBuffer[i].tags[j].isError = true;
                if (error instanceof InternalError) {
                  this._writeBuffer[i].tags[j].status = error.message;
                } else this._writeBuffer[i].tags[j].status = 'Unknown Error';
              } finally {
                await sleep(80);
              }
            }
          }
        }
        //============ WRITE SYNC ======================
        for (const query of this._syncQueue) {
          if (!query.isDone && !query.isError) {
            for (const [i, index] of query.tags.entries()) {
              const dataToWrite: Pick<MB_Params, 'area' | 'len' | 'start' | 'data'> = {
                ...this._writeBuffer.find((instance) => instance.uId === query.uId)!.tags[index - 1].params,
                data: query.data[i],
              };
              try {
                const clientIndex: number = this._writeBuffer.findIndex((instance) => instance.uId === query.uId);
                await this.rtu_WriteRegisters(this._client[clientIndex], dataToWrite);
                query.status = 'Query Done';
                query.isDone = true;
              } catch (error) {
                query.isError = true;
                if (error instanceof InternalError) {
                  query.status = error.message;
                } else query.status = 'Unknown Error during writing';
              } finally {
                await sleep(80);
              }
            }
          }
        }
        //===============
      } else {
        for (let i = 0; i < this._readBuffer.length; i++) {
          for (let j = 0; j < this._readBuffer[i].tags.length; j++) {
            this._readBuffer[i].tags[j].isError = true;
            this._readBuffer[i].tags[j].status = 'Port is closed';
            this._readBuffer[i].tags[j].data = [];
          }
        }
      }
      //===========
      this._writeBuffer = this._writeBuffer.map((device, index) => {
        return {
          uId: device.uId,
          tags: device.tags.map((tag, tagIndex) => {
            const params = { ...tag.params, data: this.writeBufferConsistent[index].tags[tagIndex].params.data };
            const toWriteBufer = { ...tag, params, execute: this.writeBufferConsistent[index].tags[tagIndex].execute ? true : false };
            this._writeBufferConsistent[index].tags[tagIndex].execute = false;
            return toWriteBufer;
          }),
        };
      });
    }, 1);
  };

  private rtu_ReadRegisters = async (client: Modbus.ModbusRTUClient, params: Pick<MB_Params, 'area' | 'len' | 'start' | 'count'>): Promise<number[]> => {
    const { start, count, len } = params;
    const startNo: number = len !== 'Bit' ? start : Math.floor(start / 16);
    const countNo: number = len !== 'Dword' ? count : count * 2;
    return new Promise<number[]>((resolve, reject) => {
      client
        .readHoldingRegisters(startNo, countNo)
        .then(({ response }) => {
          resolve(response.body.valuesAsArray as number[]);
        })
        .catch((err) => {
          const error = this.rtu_handleErrors(err);
          reject(new InternalError(`${error}`));
        });
    });
  };

  private rtu_WriteRegisters = async (client: Modbus.ModbusRTUClient, params: Pick<MB_Params, 'area' | 'len' | 'start' | 'data'>): Promise<void> => {
    const { start, data, len } = params;
    const startNo: number = len === 'Bit' ? Math.floor(start / 16) : start;
    return new Promise<void>((resolve, reject) => {
      client
        .writeMultipleRegisters(startNo, data)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          const error = this.rtu_handleErrors(err);
          reject(new InternalError(`${error}`));
        });
    });
  };

  private rtu_handleErrors = (err: any): string => {
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

  public addToSyncQueue = (data: RTU_SyncQuery): void => {
    this._syncQueue.push(data);
  };

  public removeFromSyncQueue = (id: string): void => {
    this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
  };

  public get readBuffer(): RTU_ReadBuffer[] {
    return this._readBuffer;
  }
  public get writeBufferConsistent(): RTU_WriteBuffer[] {
    return this._writeBufferConsistent;
  }
  public set writeBufferConsistent(data: RTU_WriteBuffer[]) {
    this.writeBufferConsistent = data;
  }
  public get syncQueue(): RTU_SyncQuery[] {
    return this._syncQueue;
  }
}

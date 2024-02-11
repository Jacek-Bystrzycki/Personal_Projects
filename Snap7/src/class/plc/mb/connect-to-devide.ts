import { Socket, SocketConnectOpts } from 'net';
import Modbus = require('jsmodbus');
import { CustomError, InternalError } from '../../../types/server/errors';
import { setIntervalAsync } from 'set-interval-async/fixed';
import { MB_ReadBuffer, MB_WriteBuffer, MB_ReadParams, MB_WriteParams } from '../../../types/plc/mb/buffers';

export class MB_ConnectToDevice {
  private _socket: Socket;
  private _client: Modbus.ModbusTCPClient;
  private _readBuffer: MB_ReadBuffer[];
  private _writeBuffer: MB_WriteBuffer[];
  private _isConnected: boolean = false;
  private _lastErrorMsg: string = '';
  constructor(private readonly options: SocketConnectOpts, private readonly readParams: MB_ReadParams[], private readonly writeParams: MB_WriteParams[]) {
    this._socket = new Socket();
    this._client = new Modbus.client.TCP(this._socket);
    this._readBuffer = this.readParams.map((params): MB_ReadBuffer => {
      return { params, data: [] };
    });
    this._writeBuffer = this.writeParams.map((params): MB_WriteBuffer => {
      return { params, execute: false };
    });
    // this.loop();
  }

  private loop = () => {
    this._socket.on('error', () => {
      this._isConnected = false;
    });
    this._socket.on('close', () => {
      this._isConnected = false;
    });
    this._socket.on('connect', () => {
      this._isConnected = true;
    });

    setIntervalAsync(async () => {
      if (!this._isConnected) {
        this._lastErrorMsg = 'Device offline';
        this._socket.connect(this.options);
      } else {
        try {
          this._readBuffer.forEach(async (buffer, index) => {
            const data = await this.mb_ReadRegisters(buffer.params);
            this._readBuffer[index] = { ...buffer, data };
          });
          const writeData: MB_WriteBuffer[] = this._writeBuffer.filter((data) => data.execute);
          if (writeData.length > 0) {
            writeData.forEach(async (data) => {
              await this.mb_WriteRegisters(data.params);
            });
            this._writeBuffer.forEach((data) => (data.execute = false));
          }
        } catch (error) {
          if (error instanceof CustomError) this._lastErrorMsg = error.message;
          else this._lastErrorMsg = 'Unknown error';
        }
      }
    }, 1000);
  };

  public mb_ReadRegisters = async (params: MB_ReadParams): Promise<number[]> => {
    const promise = new Promise<number[]>((resolve, reject) => {
      this._client
        .readHoldingRegisters(params.start, params.count)
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

  public mb_WriteRegisters = async (params: MB_WriteParams): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      this._client
        .writeMultipleRegisters(params.start, params.data)
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

  public get readBuffer(): MB_ReadBuffer[] {
    return this._readBuffer;
  }

  public get writeBuffer(): MB_WriteBuffer[] {
    return this._writeBuffer;
  }

  public set writeBuffer(data: MB_WriteBuffer[]) {
    this._writeBuffer = data;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get lastErrorMsg(): string {
    return this._lastErrorMsg;
  }
}

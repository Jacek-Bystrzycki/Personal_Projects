import { Socket, SocketConnectOpts } from 'net';
import Modbus = require('jsmodbus');
import { MB_Registers } from '../../../types/plc/mb/conn-params';

export class MB_ConnectToDevice {
  static countId: number = 0;
  private _id: number;
  private _socket: Socket;
  private _client: Modbus.ModbusTCPClient;
  private _readBuffer: number[] = [];
  private _isConnected: boolean = false;
  constructor(private readonly options: SocketConnectOpts) {
    this._id = ++MB_ConnectToDevice.countId;
    this._socket = new Socket();
    this._client = new Modbus.client.TCP(this._socket);
    this.reconnect();
  }

  private reconnect = () => {
    this._socket.on('error', () => {
      this._isConnected = false;
    });
    this._socket.on('close', () => {
      this._isConnected = false;
    });
    this._socket.on('connect', () => {
      this._isConnected = true;
    });

    setInterval(() => {
      if (!this._isConnected) {
        this._socket.connect(this.options);
      }
    }, 1000);
  };

  public mb_ReadRegisters = async (regs: MB_Registers): Promise<number[]> => {
    const promise = new Promise<number[]>((resolve, reject) => {
      this._client
        .readHoldingRegisters(...regs)
        .then(({ response }) => {
          this._readBuffer = response.body.valuesAsArray as number[];
          resolve(this._readBuffer);
        })
        .catch((err) => {
          const error = this.mb_handleErrors(err);
          reject(error);
        });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject('Read registers timeout'), 1000);
    });

    return Promise.race([promise, timeout]);
  };

  public mb_WriteRegisters = async (start: number, data: number[]): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      this._client
        .writeMultipleRegisters(start, data)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          const error = this.mb_handleErrors(err);
          reject(error);
        });
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject('Write registers timeout'), 1000);
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

  public get readBuffer(): number[] {
    return this._readBuffer;
  }
  public get id(): number {
    return this._id;
  }
}

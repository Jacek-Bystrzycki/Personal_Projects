import { MB_ConnectToDevice } from './connect-to-devide';
import { MB_DeviceInstance } from '../../../types/plc/mb/mb-instances';
import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import { BadRequestError, InternalError } from '../../../types/server/errors';

export class MB_CreateConnections {
  private _instances: MB_DeviceInstance[];
  constructor(private readonly deviceDefinitions: MB_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): MB_DeviceInstance[] => {
    const instances = this.deviceDefinitions.map((item) => {
      return new MB_ConnectToDevice(...item);
    });
    return instances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public mb_readFromDevice = (id: number, indexes: number[]): Array<Array<number>> => {
    const dataIndex: number = this._instances.findIndex((item) => item.id === id);
    if (dataIndex === -1) throw new BadRequestError(`Instance ${id} not exists`);

    if (!indexes.every((index) => typeof this._instances[dataIndex].instance.readBuffer[index - 1] !== 'undefined')) {
      throw new BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
    }

    if (!this._instances[dataIndex].instance.isConnected) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);

    const data: number[][] = [];

    indexes.forEach((index) => {
      data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
    });

    return data;
  };

  public mb_writeToDevice = (id: number, indexes: number[], dataToWrite: number[][]): void => {
    const dataIndex: number = this._instances.findIndex((item) => item.id === id);
    if (dataIndex === -1) throw new BadRequestError(`Instance ${id} not exists`);

    if (!this._instances[dataIndex].instance.isConnected) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);

    if (indexes.length !== dataToWrite.length) throw new BadRequestError('Wrong amount of data');

    if (!indexes.every((index) => typeof this._instances[dataIndex].instance.writeBuffer[index - 1] !== 'undefined'))
      throw new BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);

    indexes.forEach((index, i) => {
      this._instances[dataIndex].instance.writeBuffer[index - 1].params.data = dataToWrite[i];
      this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
    });
  };

  public get instances(): MB_DeviceInstance[] {
    return this._instances;
  }
}

import { S7_ConnectToPlc } from './connect-to-plc';
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_CreateConnectionsParams } from '../../../types/plc/s7/conn-param';
import { BadRequestError, InternalError } from '../../../types/server/errors';
import { waitUntil } from '../../../utils/waitUntil';

export class S7_CreateConnections {
  private _instances: S7_PLCInstance[];
  constructor(private params: S7_CreateConnectionsParams) {
    this._instances = this.s7_createConnctions();
  }

  private s7_createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.params.plcDefinitions.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public s7_readData = (id: number, indexes: number[]): Buffer[] => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);
    if (dataIndex === -1) throw new BadRequestError(`Instance ${id} not exists`);

    if (!indexes.every((index) => typeof this._instances[dataIndex].instance.readBuffer[index - 1] !== 'undefined')) {
      throw new BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
    }

    const data: Buffer[] = [];
    indexes.forEach((index) => {
      if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
        throw new InternalError(this._instances[dataIndex].instance.readBuffer[index - 1].status);
      data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
    });

    if (data.length < 1) throw new InternalError('Empty data');

    return data;
  };

  public s7_writeData = (id: number, indexes: number[], dataToWrite: Buffer[]): void => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    indexes.forEach((index, i) => {
      this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
      if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
        throw new InternalError(this._instances[dataIndex].instance.writeBuffer[index - 1].status);
      this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
    });
  };

  public s7_writeDataSync = async (id: number, indexes: number[], dataToWrite: Buffer[]): Promise<void> => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    indexes.forEach((index, i) => {
      this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
      if (this._instances[dataIndex].instance.readBuffer[index - 1].isError)
        throw new InternalError(this._instances[dataIndex].instance.writeBuffer[index - 1].status);
      this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
    });
    this._instances[dataIndex].instance.isSyncBusy = true;
    await waitUntil(() => !this._instances[dataIndex].instance.isSyncBusy);
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

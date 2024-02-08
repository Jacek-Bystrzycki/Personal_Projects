import { S7_ConnectToPlc } from './connect-to-plc';
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_CreateConnectionsParams } from '../../../types/plc/s7/conn-param';
import { BadRequestError, InternalError } from '../../../types/server/errors';

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

    if (this._instances[dataIndex].instance.isError) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);

    const data: Buffer[] = [];
    indexes.forEach((index) => {
      data.push(this._instances[dataIndex].instance.readBuffer[index - 1].data);
    });

    if (data.length < 1) throw new InternalError('Empty data');

    return data;
  };

  public s7_writeData = (id: number, indexes: number[], dataToWrite: Buffer[]): void => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    if (this._instances[dataIndex].instance.isError) throw new InternalError(this._instances[dataIndex].instance.lastErrorMsg);

    indexes.forEach((index, i) => {
      this._instances[dataIndex].instance.writeBuffer[index - 1].params.Data = dataToWrite[i];
      this._instances[dataIndex].instance.writeBuffer[index - 1].execute = true;
    });
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

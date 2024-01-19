import { S7_ConnectToPlc } from './connect-to-plc';
import snap7 = require('node-snap7');
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';
import { BadRequestError } from '../../../types/server/errors';

export class S7_CreateConnections {
  private _instances: S7_PLCInstance[];
  constructor(
    private readonly plcDefinitions: S7_ConnectionParamType[],
    private readonly readMultiVar: snap7.MultiVarRead[][],
    private writeMultiVar: snap7.MultiVarWrite[][]
  ) {
    this._instances = this.s7_createConnctions();
  }

  private s7_createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.plcDefinitions.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance) => {
      return { id: instance.id, instance };
    });
  };

  public s7_readData = async (id: number, indexes: number[]): Promise<snap7.MultiVarsReadResult[]> => {
    const instanceToRead: S7_PLCInstance | undefined = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToRead) {
      throw new BadRequestError(`Instance ${id} not exists`);
    }
    const multiVar: snap7.MultiVarRead[] = this.readMultiVar[id - 1];
    if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined'))
      throw new BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
    instanceToRead.instance.readBuffer = indexes.map((index) => multiVar[index - 1]);
    await instanceToRead.instance.s7_connectPlc();
    return instanceToRead.instance.s7_readFromPlc(instanceToRead.instance.readBuffer);
  };

  public s7_writeData = async (id: number, indexes: number[], dataToWrite: Buffer[]): Promise<void> => {
    const instanceToWrite: S7_PLCInstance | undefined = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToWrite) throw new BadRequestError(`Instance ${id} not exists`);
    if (indexes.length !== dataToWrite.length) throw new BadRequestError(`Data to write not match indexes`);
    let multiVar: snap7.MultiVarWrite[] = this.writeMultiVar[id - 1];
    if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined'))
      throw new BadRequestError(`Not all indexes [${indexes}] exist in params definitions`);
    instanceToWrite.instance.writeBuffer = indexes.map((index) => {
      return { ...multiVar[index - 1], Data: dataToWrite[index - 1] };
    });
    await instanceToWrite.instance.s7_connectPlc();
    return instanceToWrite.instance.s7_writeToPlc(instanceToWrite.instance.writeBuffer);
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

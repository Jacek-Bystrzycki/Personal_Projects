import { S7_ConnectToPlc } from './connect-to-plc';
import snap7 = require('node-snap7');
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';

export class S7_CreatePlcConnections {
  private _instances: S7_PLCInstance[];
  constructor(
    private readonly plcDefinitions: S7_ConnectionParamType[],
    private readonly readMultiVar: snap7.MultiVarRead[][],
    private writeMultiVar: snap7.MultiVarWrite[][]
  ) {
    this._instances = this.createConnctions();
  }

  private createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.plcDefinitions.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance) => {
      return { id: instance.id, instance };
    });
  };

  public readData = async (id: number, indexes: number[]): Promise<snap7.MultiVarsReadResult[]> => {
    const instanceToRead = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToRead) {
      throw new Error(`Instance ${id} not exists`);
    }
    const multiVar: snap7.MultiVarRead[] = this.readMultiVar[id - 1];
    if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined')) throw new Error(`Not all indexes [${indexes}] exist in params definitions`);
    instanceToRead.instance.readBuffer = indexes.map((index) => multiVar[index - 1]);
    await instanceToRead.instance.connectPlc();
    return instanceToRead.instance.readFromPlc(instanceToRead.instance.readBuffer);
  };

  public writeData = async (id: number, indexes: number[], dataToWrite: Buffer[]): Promise<void> => {
    const instanceToWrite = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToWrite) throw new Error(`Instance ${id} not exists`);
    if (indexes.length !== dataToWrite.length) throw new Error(`Data to write not match indexes`);
    let multiVar: snap7.MultiVarWrite[] = this.writeMultiVar[id - 1];
    if (!indexes.every((index) => typeof multiVar[index - 1] !== 'undefined')) throw new Error(`Not all indexes [${indexes}] exist in params definitions`);
    instanceToWrite.instance.writeBuffer = indexes.map((index) => {
      return { ...multiVar[index - 1], Data: dataToWrite[index - 1] };
    });
    await instanceToWrite.instance.connectPlc();
    return instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

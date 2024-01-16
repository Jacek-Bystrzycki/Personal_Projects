import { S7_ConnectToPlc } from './connect-to-plc';
import snap7 = require('node-snap7');
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';
import { getDateAsString } from '../../../utils/get-date-as-string';

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

  public readData = async (id: number): Promise<snap7.MultiVarsReadResult[]> => {
    const instanceToRead = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToRead) {
      console.log(`Instance ${id} not exists`);
      return [];
    }
    const multiVar: snap7.MultiVarRead[] = this.readMultiVar[id - 1];
    instanceToRead.instance.readBuffer = multiVar;
    try {
      await instanceToRead.instance.connectPlc();
      return await instanceToRead.instance.readFromPlc(instanceToRead.instance.readBuffer);
    } catch (error) {
      console.log(`${getDateAsString()}Cannot read from PLC id: ${id}: ${error}`);
      return [];
    }
  };

  // public writeData = async (id: number, writeMultiVar: snap7.MultiVarWrite[][]): Promise<void> => {
  //   const instanceToWrite = this._instances.find((instance) => {
  //     return instance.id === id;
  //   });
  //   if (!instanceToWrite) return console.log(`Instance ${id} not exists`);
  //   const multiVar: snap7.MultiVarWrite[] = writeMultiVar[id - 1];
  //   instanceToWrite.instance.writeBuffer = multiVar;
  //   try {
  //     await instanceToWrite.instance.connectPlc();
  //     await instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
  //   } catch (error) {
  //     console.log(`${getDateAsString()}Cannot write to PLC id: ${id}: ${error}`);
  //   }
  // };
  public writeData = async (id: number, dataToWrite: Buffer[]): Promise<void> => {
    const instanceToWrite = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToWrite) return console.log(`Instance ${id} not exists`);
    let multiVar: snap7.MultiVarWrite[] = this.writeMultiVar[id - 1];
    multiVar = multiVar.map((item, index) => {
      item = { ...item, Data: dataToWrite[index] };
      return item;
    });
    instanceToWrite.instance.writeBuffer = multiVar;
    try {
      await instanceToWrite.instance.connectPlc();
      await instanceToWrite.instance.writeToPlc(instanceToWrite.instance.writeBuffer);
    } catch (error) {
      console.log(`${getDateAsString()}Cannot write to PLC id: ${id}: ${error}`);
    }
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

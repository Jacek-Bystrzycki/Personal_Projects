import { ConnectToPlc } from './connect-to-plc';
import { PLCInstance } from '../../../types/plc/s7/plc-instance';
import { ConnectionParamType } from '../../../types/plc/s7/conn-param';

export class CreatePlcConnections {
  private _instances: PLCInstance[];
  constructor(private readonly plcDefinitions: ConnectionParamType[]) {
    this._instances = this.createConnctions();
  }

  private createConnctions = (): PLCInstance[] => {
    const plcInstances: ConnectToPlc[] = this.plcDefinitions.map((plc) => {
      return new ConnectToPlc(...plc);
    });
    return plcInstances.map((instance) => {
      return { id: instance.id, instance };
    });
  };

  public connectToPlc = (id: number): void => {
    const instanceToConnect = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (instanceToConnect) instanceToConnect.instance.controlPlcConnection();
  };

  public connectionStatus = (id: number): boolean => {
    const instanceToStatus = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (instanceToStatus) return instanceToStatus.instance.connected;
    return false;
  };

  public readData = async (id: number, db: number, start: number, len: number): Promise<Buffer | void> => {
    const instanceToRead = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (this.connectionStatus(id)) {
      if (!instanceToRead) return console.log(`Instance ${id} not exists`);
      return await instanceToRead.instance.readFromPlc(db, start, len);
    } else console.log(`Cannot read while unconnected to PLC: ${id}`);
  };

  public writeData = async (id: number, db: number, start: number, len: number): Promise<void> => {
    const instanceToWrite = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (this.connectionStatus(id)) {
      if (!instanceToWrite) return console.log(`Instance ${id} not exists`);
      const data = instanceToWrite.instance.writeBuffer;
      await instanceToWrite.instance.writeToPlc(db, start, len, data);
    } else console.log(`Cannot write while unconnected to PLC: ${id}`);
  };

  public setWriteBuffer = (id: number, data: Buffer): void => {
    const instanceToSetBuffer = this._instances.find((instance) => {
      return instance.id === id;
    });
    if (!instanceToSetBuffer) return console.log(`Instance ${id} not exists`);
    instanceToSetBuffer.instance.writeBuffer = data;
  };

  public get instances(): PLCInstance[] {
    return this._instances;
  }
}

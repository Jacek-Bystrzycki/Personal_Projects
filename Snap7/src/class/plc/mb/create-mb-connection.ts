import { MB_ConnectToDevice } from './connect-to-devide';
import { MB_DeviceInstance } from '../../../types/plc/mb/mb-instances';
import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import { MB_Registers } from '../../../types/plc/mb/conn-params';
import { BadRequestError } from '../../../types/server/errors';

export class MB_CreateConnections {
  private _instances: MB_DeviceInstance[];
  constructor(private readonly deviceDefinitions: MB_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): MB_DeviceInstance[] => {
    const instances = this.deviceDefinitions.map((item) => {
      return new MB_ConnectToDevice(...item);
    });
    return instances.map((instance) => {
      return { id: instance.id, instance };
    });
  };

  public mb_ReadFromDevice = async (id: number, regs: MB_Registers): Promise<number[]> => {
    const instanceToRead: MB_DeviceInstance | undefined = this._instances.find((item) => {
      return item.id === id;
    });
    if (!instanceToRead) throw new BadRequestError(`Instance ${id} not exists`);
    return instanceToRead.instance.mb_ReadRegisters(regs);
  };
  public mb_WriteToDevice = async (id: number, start: number, data: number[]): Promise<void> => {
    const instanceToWrite: MB_DeviceInstance | undefined = this._instances.find((item) => {
      return item.id === id;
    });
    if (!instanceToWrite) throw new BadRequestError(`Instance ${id} not exists`);
    return instanceToWrite.instance.mb_WriteRegisters(start, data);
  };

  public get instances(): MB_DeviceInstance[] {
    return this._instances;
  }
}

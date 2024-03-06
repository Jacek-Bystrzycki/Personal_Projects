import { UA_DeviceInstance } from '../../../types/plc/ua/ua-instances';
import { UA_ConnectionParamType } from '../../../types/plc/ua/conn-params';
import { UA_ConnectToDevice } from './connect-to-device';

export class UA_CreateConnections {
  private _instances: UA_DeviceInstance[];
  constructor(private readonly uaDefinitions: UA_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): UA_DeviceInstance[] => {
    const instances = this.uaDefinitions.map((item) => {
      return new UA_ConnectToDevice(...item);
    });
    return instances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };
  public get instances(): UA_DeviceInstance[] {
    return this._instances;
  }
}

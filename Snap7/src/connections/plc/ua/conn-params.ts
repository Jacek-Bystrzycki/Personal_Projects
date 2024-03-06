import { UA_ConnectionParamType } from '../../../types/plc/ua/conn-params';
import { UA_TagDef } from '../../../types/plc/ua/format';

export class UA_Definition {
  private _device: UA_ConnectionParamType;
  constructor(private readonly endpointUrl: string, private readonly tags: UA_TagDef[]) {
    this._device = [this.endpointUrl, this.tags];
  }
  public get device(): UA_ConnectionParamType {
    return this._device;
  }
}

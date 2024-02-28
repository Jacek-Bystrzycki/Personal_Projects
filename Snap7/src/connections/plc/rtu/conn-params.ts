import { RTU_ConnectionParamType } from '../../../types/plc/rtu/conn-params';
import type { RTUConDef } from '../../../types/plc/rtu/definitions';
import type { MB_TagDef } from '../../../types/plc/mb/format';

export class RTU_Defintion {
  private _device: RTU_ConnectionParamType;
  constructor(private readonly portName: string, private readonly definitions: RTUConDef[]) {
    const uId: number[] = this.definitions.map((def) => def.uId);
    const tags: MB_TagDef[][] = this.definitions.map((def) => def.tags);
    this._device = [this.portName, uId, tags];
  }

  public get device(): RTU_ConnectionParamType {
    return this._device;
  }
}

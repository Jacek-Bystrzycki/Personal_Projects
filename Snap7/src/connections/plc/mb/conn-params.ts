import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import type { MB_TagDef } from '../../../types/plc/mb/format';
import { SocketConnectOpts } from 'net';

export class MB_Defintion {
  private _device: MB_ConnectionParamType;
  constructor(private readonly options: SocketConnectOpts, private readonly uId: number, private readonly tags: MB_TagDef[]) {
    this._device = [this.options, this.uId, this.tags];
  }

  public get device(): MB_ConnectionParamType {
    return this._device;
  }
}

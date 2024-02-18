import { Request, Response, NextFunction } from 'express';
import { ServerDevices } from '../../../types/server/server-types';
import type { S7_BeforeFormatRead, S7_AfterFormatRead } from '../../../types/plc/s7/request';
import { s7_formatReadData } from './formatData';

export class Universal_Controller {
  constructor(private readonly devices: ServerDevices) {}

  public readAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      //================== S7 ===================
      if (this.devices.s7_definitions) {
        const s7_ids = this.devices.s7_definitions.instances.map((instance) => {
          return instance.id;
        });
        const s7_tags = this.devices.s7_definitions.instances.map((instance) => {
          return instance.instance.readBufferConsistent.map((tag) => {
            return tag.id;
          });
        });
        const s7_tagsBefore: S7_BeforeFormatRead[] = this.devices.s7_definitions.s7_readData(s7_ids, s7_tags);
        const s7_tagAfter: S7_AfterFormatRead[] = s7_formatReadData(s7_tagsBefore);
        res.s7Tags = s7_tagAfter;
      }
      //================== MB ===================
      next();
    } catch (error) {
      next(error);
    }
  };
}

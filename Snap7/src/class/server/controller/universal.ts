import { Request, Response, NextFunction } from 'express';
import { ServerDevices } from '../../../types/server/server-types';
import type { S7_BeforeFormatRead, S7_AfterFormatRead } from '../../../types/plc/s7/request';
import { s7_formatReadData } from './s7-formatData';
import type { MB_BeforeFormatRead, MB_AfterFormatRead } from '../../../types/plc/mb/request';
import { mb_formatReadData } from './mb-formatData';

export class Universal_Controller {
  constructor(private readonly devices: ServerDevices) {}

  public readAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      //================== S7 ===================
      if (this.devices.s7_definitions) {
        const s7_ids: number[] = this.devices.s7_definitions.instances.map((instance) => {
          return instance.id;
        });
        const s7_tags: number[][] = this.devices.s7_definitions.instances.map((instance) => {
          return instance.instance.readBufferConsistent.map((tag) => {
            return tag.id;
          });
        });
        const s7_tagsBefore: S7_BeforeFormatRead[] = this.devices.s7_definitions.s7_readData(s7_ids, s7_tags);
        const s7_tagAfter: S7_AfterFormatRead[] = s7_formatReadData(s7_tagsBefore);
        res.s7Tags = s7_tagAfter;
      }
      //================== MB ===================
      if (this.devices.mb_definitions) {
        const mb_ids: number[] = this.devices.mb_definitions.instances.map((instance) => {
          return instance.id;
        });
        const mb_tags: number[][] = this.devices.mb_definitions.instances.map((instance) => {
          return instance.instance.readBufferConsistent.map((tag) => {
            return tag.id;
          });
        });
        const mb_tagsBefore: MB_BeforeFormatRead[] = this.devices.mb_definitions.mb_readFromDevice(mb_ids, mb_tags);
        const mb_tagAfter: MB_AfterFormatRead[] = mb_formatReadData(mb_tagsBefore);
        res.mbTags = mb_tagAfter;
        //================== RTU ===================
        if (this.devices.rtu_definitions) {
          const rtu_ids: number[] = this.devices.rtu_definitions.instances.instance.readBuffer.map((instance) => {
            return instance.uId;
          });
          const rtu_tags: number[][] = this.devices.rtu_definitions.instances.instance.readBuffer.map((instance) => {
            return instance.tags.map((tag) => {
              return tag.id;
            });
          });
          const rtu_tagsBefore: MB_BeforeFormatRead[] = this.devices.rtu_definitions.rtu_readFromDevice(rtu_ids, rtu_tags);
          const rtu_tagAfter: MB_AfterFormatRead[] = mb_formatReadData(rtu_tagsBefore);
          res.rtuTags = rtu_tagAfter;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

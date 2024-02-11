import snap7 = require('node-snap7');
import type { S7_Format } from './format';

export type S7_ReadBuffer = {
  params: snap7.MultiVarRead;
  data: Buffer;
  format: S7_Format;
  isError: boolean;
  status: string;
};

export type S7_WriteBuffer = {
  params: snap7.MultiVarWrite;
  execute: boolean;
  format: S7_Format;
  isError: boolean;
  status: string;
};

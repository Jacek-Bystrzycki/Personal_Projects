import { S7_Format } from './format';
import type { S7_ReadTag } from './tags';
import snap7 = require('node-snap7');

type S7_Info = {
  deviceId: number;
  type: 's7';
  db: number;
  startAddr: number;
  amount: number;
};

//Read request
export type S7_BeforeFormatRead = {
  isError: boolean;
  status: string;
  data: Buffer;
  id: number;
  format: S7_Format;
  wordLen: snap7.WordLen;
  address: S7_Info;
};

export type S7_AfterFormatRead = {
  isError: boolean;
  status: string;
  id: number;
  format: S7_Format;
  wordLen: snap7.WordLen;
  address: S7_Info;
  values: number[] | number[][];
};

//Write request
export type S7_BeforeFormatWrite = {
  type: snap7.WordLen;
  data: number[] | number[][];
  id: number;
  format: S7_Format;
};

export type S7_DataResponseWrite = {
  data: Buffer;
  tagId: number;
};

export type S7_AfterFormatWrite = {
  instanceId: number;
  writeTags: S7_DataResponseWrite[];
};

import type { S7_ReadTag } from './tags';
import snap7 = require('node-snap7');

type S7_FormatWordLen = {
  wordLen: snap7.WordLen;
};
type S7_Amount = {
  amount: number;
};

//Read request
export type S7_BeforeFormatRead = Pick<S7_ReadTag, 'isError' | 'status' | 'data' | 'id' | 'format'> & S7_FormatWordLen & S7_Amount;

export type S7_DataResponseRead = {
  amount: number;
  values: number[] | number[][];
};

export type S7_AfterFormatRead = Pick<S7_ReadTag, 'isError' | 'status' | 'id' | 'format'> & S7_DataResponseRead;

//Write request
export type S7_BeforeFormatWrite = {
  type: snap7.WordLen;
  data: number[] | number[][];
} & Pick<S7_ReadTag, 'format' | 'id'>;

export type S7_DataResponseWrite = {
  data: Buffer;
  tagId: number;
};

export type S7_AfterFormatWrite = {
  instanceId: number;
  writeTags: S7_DataResponseWrite[];
};

import type { MB_Format, MB_TagType } from './format';

type MB_Info = {
  deviceId: number;
  type: 'mb' | 'rtu';
  holdingRegister: number;
  amount: number;
};

//Read request
export type MB_BeforeFormatRead = {
  isError: boolean;
  status: string;
  data: number[];
  id: number;
  len: MB_TagType;
  format: MB_Format;
  address: MB_Info;
};

export type MB_AfterFormatRead = {
  isError: boolean;
  status: string;
  id: number;
  len: MB_TagType;
  format: MB_Format;
  address: MB_Info;
  values: number[] | number[][];
};

//Write request
export type MB_BeforeFormatWrite = {
  len: MB_TagType;
  data: number[] | number[][];
  id: number;
  format: MB_Format;
  bitDataForRead?: number[];
  startAddForRead?: number;
};

export type MB_DataResponseWrite = {
  data: number[];
  tagId: number;
};

export type MB_AfterFormatWrite = {
  instanceId: number;
  writeTags: MB_DataResponseWrite[];
};

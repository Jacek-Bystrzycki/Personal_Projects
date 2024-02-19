import type { MB_Format, MB_TagType } from './format';

type MB_Info = {
  deviceId: number;
  type: 'mb';
  holdingRegister: number;
  amount: number;
};

export type MB_BeforeFormatRead = {
  isError: boolean;
  status: string;
  data: number[] | number[][];
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

import type { S7_ReadTag } from './tags';

export type S7_BeforeFormat = Pick<S7_ReadTag, 'isError' | 'status' | 'data' | 'id'>;

export type S7_DataResponse = {
  values: number[] | number[][];
};

export type S7_AfterFormat = Pick<S7_ReadTag, 'isError' | 'status' | 'id'> & S7_DataResponse;

import type { S7_ReadTag } from './tags';

export type BeforeFormat = Pick<S7_ReadTag, 'isError' | 'status' | 'data' | 'id'>;

export type DataResponse = {
  values: number[] | number[][];
};

export type AfterFormat = Pick<S7_ReadTag, 'isError' | 'status' | 'id'> & DataResponse;

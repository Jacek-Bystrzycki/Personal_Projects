import type { S7_ReadBuffer } from './buffers';

export type BeforeFormat = Pick<S7_ReadBuffer, 'isError' | 'status' | 'data'>;

export type DataResponse = {
  values: number[] | number[][];
};

export type AfterFormat = Pick<S7_ReadBuffer, 'isError' | 'status'> & DataResponse;

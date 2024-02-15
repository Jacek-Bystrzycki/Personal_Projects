import type { MB_Params, MB_Format } from './format';

export type MB_ReadTag = {
  params: Pick<MB_Params, 'area' | 'type' | 'start' | 'count'>;
  id: number;
  format: MB_Format;
  data: number[];
  isError: boolean;
  status: string;
};

export type MB_WriteTag = {
  params: Pick<MB_Params, 'area' | 'type' | 'start' | 'data'>;
  id: number;
  execute: boolean;
  format: MB_Format;
  isError: boolean;
  status: string;
};

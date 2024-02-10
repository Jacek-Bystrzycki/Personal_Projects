export type MB_ReadParams = {
  start: number;
  count: number;
};

export type MB_WriteParams = {
  start: number;
  data: number[];
};

export type MB_ReadBuffer = {
  params: MB_ReadParams;
  data: number[];
};

export type MB_WriteBuffer = {
  params: MB_WriteParams;
  execute: boolean;
};

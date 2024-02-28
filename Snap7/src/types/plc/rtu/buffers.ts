import type { MB_ReadTag, MB_WriteTag } from '../mb/tags';

export type RTU_ReadBuffer = {
  uId: number;
  tags: MB_ReadTag[];
};

export type RTU_WriteBuffer = {
  uId: number;
  tags: MB_WriteTag[];
};

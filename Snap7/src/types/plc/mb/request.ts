import type { MB_ReadTag } from './tags';

export type MB_BeforeFormat = Pick<MB_ReadTag, 'isError' | 'status' | 'id' | 'data'>;

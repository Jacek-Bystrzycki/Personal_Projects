import snap7 = require('node-snap7');

export const s7_format = [
  'Bit',
  'Byte_As_BitArray',
  'Byte_As_Int',
  'Byte_As_Uint',
  'Word_As_BitArray',
  'Word_As_Int',
  'Word_As_Uint',
  'Dword_As_BitArray',
  'Dword_As_Int',
  'Dword_As_Uint',
  'Real',
] as const;

export type S7_Format = (typeof s7_format)[number];

export type S7_ReadTagDef = {
  params: snap7.MultiVarRead;
  format: S7_Format;
  id: number;
};

export type S7_WriteTagDef = {
  params: snap7.MultiVarWrite;
  format: S7_Format;
  id: number;
};

export type S7_Tags = {
  read: S7_ReadTagDef[];
  write: S7_WriteTagDef[];
};

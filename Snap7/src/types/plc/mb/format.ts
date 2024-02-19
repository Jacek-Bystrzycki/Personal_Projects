export type MB_Area = 'HoldingRegister';

export const mb_tagType = ['Bit', 'Word', 'Dword'] as const;
export type MB_TagType = (typeof mb_tagType)[number];

export const mb_format = ['Bit', 'Word_As_BitArray', 'Word_As_Int', 'Word_As_Uint', 'Float', 'FloatInverted'] as const;
export type MB_Format = (typeof mb_format)[number];

export type MB_Params = {
  area: MB_Area;
  len: MB_TagType;
  start: number;
  count: number;
  data: number[];
};

export type MB_TagDef = {
  params: MB_Params;
  id: number;
  format: MB_Format;
};

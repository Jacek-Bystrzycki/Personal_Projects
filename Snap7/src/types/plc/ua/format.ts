export const ua_tagType = ['Boolean', 'SByte', 'Byte', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Float', 'Double'] as const;

export type UA_TagType = (typeof ua_tagType)[number];

export type UA_TagDef = {
  id: number;
  nodeId: string;
  dataType: UA_TagType;
};

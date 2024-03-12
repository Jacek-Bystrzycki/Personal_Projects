import { UA_TagType } from './format';

export type UA_ReadFormat = {
  deviceId: number;
  id: number;
  type: 'ua';
  isError: boolean;
  status: string;
  dataType: UA_TagType;
  value: number[];
};

export type UA_DataResponseWrite = {
  data: number[];
  tagId: number;
};

export type UA_WriteFormat = {
  instanceId: number;
  writeTags: UA_DataResponseWrite[];
};

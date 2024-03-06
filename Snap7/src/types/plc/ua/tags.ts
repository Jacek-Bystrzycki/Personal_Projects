import { NodeId, DataType } from 'node-opcua-client';

export type UA_ReadTag = {
  id: number;
  nodeId: NodeId;
  dataType: DataType;
  data: number | boolean | null;
  isError: boolean;
  status: string;
};

export type UA_WriteTag = {
  id: number;
  execute: boolean;
  nodeId: NodeId;
  dataType: DataType;
  data: number | null;
  isError: boolean;
  status: string;
};

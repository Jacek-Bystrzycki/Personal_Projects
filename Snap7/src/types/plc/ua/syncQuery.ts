export type UA_SyncQuery = {
  queryId: string;
  tags: number[];
  data: number[][];
  isDone: boolean;
  isError: boolean;
  status: string;
};

export type MB_SyncQuery = {
  queryId: string;
  indexes: number[];
  data: number[][];
  isDone: boolean;
  isError: boolean;
  errorMsg: string;
};

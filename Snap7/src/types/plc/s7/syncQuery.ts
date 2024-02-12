export type SyncQuery = {
  queryId: string;
  indexes: number[];
  data: Buffer[];
  isDone: boolean;
  isError: boolean;
  errorMsg: string;
};

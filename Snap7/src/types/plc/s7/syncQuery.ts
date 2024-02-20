export type S7_SyncQuery = {
  queryId: string;
  tags: number[];
  data: Buffer[];
  isDone: boolean;
  isError: boolean;
  status: string;
};

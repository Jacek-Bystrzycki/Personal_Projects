export type RTU_SyncQuery = {
  queryId: string;
  uId: number;
  tags: number[];
  data: number[][];
  isDone: boolean;
  isError: boolean;
  status: string;
};

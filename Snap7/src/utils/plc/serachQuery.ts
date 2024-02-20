import type { S7_SyncQuery } from '../../types/plc/s7/syncQuery';
import type { MB_SyncQuery } from '../../types/plc/mb/syncQuery';

export const searchQueueForDone = (id: string, queue: S7_SyncQuery[] | MB_SyncQuery[]): boolean => {
  const findQuery = queue.find((query) => query.queryId === id);
  return findQuery?.isDone === true;
};

export const searchQueueForError = (id: string, queue: S7_SyncQuery[] | MB_SyncQuery[]): boolean => {
  const findQuery = queue.find((query) => query.queryId === id);
  return findQuery?.isError === true;
};

export const searchQueueForErrorMsg = (id: string, queue: S7_SyncQuery[] | MB_SyncQuery[]): string => {
  const findQuery = queue.find((query) => query.queryId === id);
  return findQuery?.status || 'No message';
};

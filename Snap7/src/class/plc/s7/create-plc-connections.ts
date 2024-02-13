import { S7_ConnectToPlc } from './connect-to-plc';
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_CreateConnectionsParams } from '../../../types/plc/s7/conn-param';
import { InternalError } from '../../../types/server/errors';
import { BeforeFormat } from '../../../types/plc/s7/respose';
import { waitUntil } from '../../../utils/waitUntil';
import { nanoid } from 'nanoid';
import { SyncQuery } from '../../../types/plc/s7/syncQuery';

export class S7_CreateConnections {
  private _instances: S7_PLCInstance[];
  constructor(private params: S7_CreateConnectionsParams) {
    this._instances = this.s7_createConnctions();
  }

  private s7_createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.params.plcDefinitions.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public s7_readData = (id: number, indexes: number[]): BeforeFormat[] => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    const resp: BeforeFormat[] = [];

    indexes.forEach((index) => {
      const data: BeforeFormat = {
        isError: this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError,
        status: this._instances[dataIndex].instance.readBufferConsistent[index - 1].status,
        data: this._instances[dataIndex].instance.readBufferConsistent[index - 1].data,
        id: this._instances[dataIndex].instance.readBufferConsistent[index - 1].id,
      };
      resp.push(data);
    });

    return resp;
  };

  public s7_writeData = (id: number, indexes: number[], dataToWrite: Buffer[]): void => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    indexes.forEach((index, i) => {
      this._instances[dataIndex].instance.writeBufferConsistent[index - 1].execute = true;
      if (this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError)
        throw new InternalError(this._instances[dataIndex].instance.writeBufferConsistent[index - 1].status);
      this._instances[dataIndex].instance.writeBufferConsistent[index - 1].params.Data = dataToWrite[i];
    });
  };

  public s7_writeDataSync = async (id: number, indexes: number[], dataToWrite: Buffer[]): Promise<void> => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    const query: SyncQuery = {
      queryId: nanoid(),
      indexes,
      data: dataToWrite,
      isDone: false,
      isError: false,
      errorMsg: '',
    };

    this._instances[dataIndex].instance.addToSyncQueue(query);

    const searchQueueForDone = (id: string): boolean => {
      const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
      return findQuery?.isDone === true;
    };
    const searchQueueForError = (id: string): boolean => {
      const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
      return findQuery?.isError === true;
    };
    const searchQueueForErrorMsg = (id: string): string => {
      const findQuery = this._instances[dataIndex].instance.syncQueue.find((query) => query.queryId === id);
      return findQuery?.errorMsg || 'No message';
    };
    try {
      await waitUntil(
        () => searchQueueForDone(query.queryId),
        () => searchQueueForError(query.queryId),
        () => searchQueueForErrorMsg(query.queryId)
      );
    } catch (error) {
      if (typeof error === 'string') throw new InternalError(error);
      else throw new InternalError('Unknown error');
    } finally {
      this._instances[dataIndex].instance.removeFromSyncQueue(query.queryId);
    }
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

import { S7_ConnectToPlc } from './connect-to-plc';
import { S7_PLCInstance } from '../../../types/plc/s7/plc-instance';
import { S7_ConnectionParamType } from '../../../types/plc/s7/conn-param';
import { InternalError } from '../../../types/server/errors';
import { S7_BeforeFormatRead } from '../../../types/plc/s7/request';
import { waitUntil } from '../../../utils/waitUntil';
import { nanoid } from 'nanoid';
import { S7_SyncQuery } from '../../../types/plc/s7/syncQuery';
import { searchQueueForDone, searchQueueForError, searchQueueForErrorMsg } from '../../../utils/plc/serachQuery';
import type { S7_AfterFormatWrite } from '../../../types/plc/s7/request';

export class S7_CreateConnections {
  private _instances: S7_PLCInstance[];
  constructor(private params: S7_ConnectionParamType[]) {
    this._instances = this.s7_createConnctions();
  }

  private s7_createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.params.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public s7_readData = (id: number, tags: number[]): S7_BeforeFormatRead[] => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    const resp: S7_BeforeFormatRead[] = [];

    tags.forEach((tag) => {
      const data: S7_BeforeFormatRead = {
        isError: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.isError,
        status: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.status,
        data: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.data,
        id: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.id,
        format: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.format,
        wordLen: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.WordLen,
        address: {
          deviceId: dataIndex,
          type: 's7',
          db: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.DBNumber!,
          startAddr: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.Start,
          amount: this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.Amount,
        },
      };
      resp.push(data);
    });

    return resp;
  };

  public s7_writeData = (dataToWrite: S7_AfterFormatWrite): void => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    dataToWrite.writeTags.forEach((tag, i) => {
      if (this._instances[dataIndex].instance.readBufferConsistent.find((searchTag) => searchTag.id === tag.tagId)?.isError)
        throw new InternalError(this._instances[dataIndex].instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId)!.status);
      this._instances[dataIndex].instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId)!.execute = true;
      this._instances[dataIndex].instance.writeBufferConsistent.find((searchTag) => searchTag.id === tag.tagId)!.params.Data = dataToWrite.writeTags[i].data;
    });
  };

  public s7_writeDataSync = async (dataToWrite: S7_AfterFormatWrite): Promise<void> => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    const query: S7_SyncQuery = {
      queryId: nanoid(),
      indexes: dataToWrite.writeTags.map((tag) => tag.tagId),
      data: dataToWrite.writeTags.map((tag) => tag.data),
      isDone: false,
      isError: false,
      errorMsg: '',
    };

    this._instances[dataIndex].instance.addToSyncQueue(query);

    try {
      await waitUntil(
        () => searchQueueForDone(query.queryId, this._instances[dataIndex].instance.syncQueue),
        () => searchQueueForError(query.queryId, this._instances[dataIndex].instance.syncQueue),
        () => searchQueueForErrorMsg(query.queryId, this._instances[dataIndex].instance.syncQueue)
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

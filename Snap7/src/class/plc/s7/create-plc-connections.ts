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
  constructor(private s7Definitions: S7_ConnectionParamType[]) {
    this._instances = this.s7_createConnctions();
  }

  private s7_createConnctions = (): S7_PLCInstance[] => {
    const plcInstances: S7_ConnectToPlc[] = this.s7Definitions.map((plc) => {
      return new S7_ConnectToPlc(...plc);
    });
    return plcInstances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public s7_readData = (id: number[], tags: number[][]): S7_BeforeFormatRead[] => {
    const resp: S7_BeforeFormatRead[] = [];

    id.forEach((singleId, index) => {
      tags[index].forEach((tag) => {
        const currentTag = this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!;
        const data: S7_BeforeFormatRead = {
          isError: currentTag.isError,
          status: currentTag.status,
          data: currentTag.data,
          id: currentTag.id,
          format: currentTag.format,
          wordLen: currentTag.params.WordLen,
          address: {
            deviceId: singleId,
            type: 's7',
            db: currentTag.params.DBNumber!,
            startAddr: currentTag.params.Start,
            amount: currentTag.params.Amount,
          },
        };
        resp.push(data);
      });
    });

    return resp;
  };

  public s7_writeData = (dataToWrite: S7_AfterFormatWrite): void => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    dataToWrite.writeTags.forEach((tag) => {
      const tagIndex = this._instances[idIndex].instance.writeBufferConsistent.findIndex((searchTag) => searchTag.id === tag.tagId);
      if (this._instances[idIndex].instance.readBufferConsistent[tagIndex].isError)
        throw new InternalError(this._instances[idIndex].instance.writeBufferConsistent[tagIndex].status);

      this._instances[idIndex].instance.writeBufferConsistent[tagIndex].execute = true;
      this._instances[idIndex].instance.writeBufferConsistent[tagIndex].params.Data = tag.data;
    });
  };

  public s7_writeDataSync = async (dataToWrite: S7_AfterFormatWrite): Promise<Partial<S7_SyncQuery>> => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    const query: S7_SyncQuery = {
      queryId: nanoid(),
      tags: dataToWrite.writeTags.map((tag) => tag.tagId),
      data: dataToWrite.writeTags.map((tag) => tag.data),
      isDone: false,
      isError: false,
      status: 'Not triggered',
    };

    this._instances[idIndex].instance.addToSyncQueue(query);

    try {
      await waitUntil(
        () => searchQueueForDone(query.queryId, this._instances[idIndex].instance.syncQueue),
        () => searchQueueForError(query.queryId, this._instances[idIndex].instance.syncQueue),
        () => searchQueueForErrorMsg(query.queryId, this._instances[idIndex].instance.syncQueue)
      );
      return {
        queryId: query.queryId,
        isDone: query.isDone,
        status: query.status,
        tags: query.tags,
      };
    } catch (error) {
      if (typeof error === 'string') throw new InternalError(error);
      else throw new InternalError('Unknown error');
    } finally {
      this._instances[idIndex].instance.removeFromSyncQueue(query.queryId);
    }
  };

  public get instances(): S7_PLCInstance[] {
    return this._instances;
  }
}

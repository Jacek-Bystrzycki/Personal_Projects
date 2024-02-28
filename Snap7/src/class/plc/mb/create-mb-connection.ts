import { MB_ConnectToDevice } from './connect-to-device';
import { MB_DeviceInstance } from '../../../types/plc/mb/mb-instances';
import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import { InternalError } from '../../../types/server/errors';
import { MB_BeforeFormatRead, MB_AfterFormatWrite } from '../../../types/plc/mb/request';
import { nanoid } from 'nanoid';
import type { MB_SyncQuery } from '../../../types/plc/mb/syncQuery';
import { searchQueueForDone, searchQueueForError, searchQueueForErrorMsg } from '../../../utils/plc/serachQuery';
import { waitUntil } from '../../../utils/waitUntil';

export class MB_CreateConnections {
  private _instances: MB_DeviceInstance[];
  constructor(private readonly mbDefinitions: MB_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): MB_DeviceInstance[] => {
    const instances = this.mbDefinitions.map((item) => {
      return new MB_ConnectToDevice(...item);
    });
    return instances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public mb_readFromDevice = (id: number[], tags: number[][]): MB_BeforeFormatRead[] => {
    const resp: MB_BeforeFormatRead[] = [];

    id.forEach((singleId, index) => {
      tags[index].forEach((tag) => {
        const currentTag = this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!;
        const data: MB_BeforeFormatRead = {
          isError: currentTag.isError,
          status: currentTag.status,
          data: currentTag.data,
          id: currentTag.id,
          len: currentTag.params.len,
          format: currentTag.format,
          address: {
            deviceId: singleId,
            type: 'mb',
            holdingRegister: currentTag.params.start,
            amount: currentTag.params.count,
          },
        };
        resp.push(data);
      });
    });

    return resp;
  };

  public mb_writeToDevice = (dataToWrite: MB_AfterFormatWrite): void => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    dataToWrite.writeTags.forEach((tag) => {
      const tagIndex = this._instances[idIndex].instance.writeBufferConsistent.findIndex((searchTag) => searchTag.id === tag.tagId);
      if (this._instances[idIndex].instance.readBufferConsistent[tagIndex].isError)
        throw new InternalError(this._instances[idIndex].instance.writeBufferConsistent[tagIndex].status);

      this._instances[idIndex].instance.writeBufferConsistent[tagIndex].execute = true;
      this._instances[idIndex].instance.writeBufferConsistent[tagIndex].params.data = tag.data;
    });
  };

  public mb_writeToDeviceSync = async (dataToWrite: MB_AfterFormatWrite): Promise<Partial<MB_SyncQuery>> => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    const query: MB_SyncQuery = {
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

  public get instances(): MB_DeviceInstance[] {
    return this._instances;
  }
}

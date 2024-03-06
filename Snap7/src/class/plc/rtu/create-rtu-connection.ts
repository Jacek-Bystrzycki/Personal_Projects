import { RTU_DeviceInstance } from '../../../types/plc/rtu/rtu-instances';
import { RTU_ConnectionParamType } from '../../../types/plc/rtu/conn-params';
import { RTU_ConnectToDevice } from './connect-to-device';
import { MB_BeforeFormatRead, MB_AfterFormatWrite } from '../../../types/plc/mb/request';
import { InternalError } from '../../../types/server/errors';
import { RTU_SyncQuery } from '../../../types/plc/rtu/syncQuery';
import { nanoid } from 'nanoid';
import { waitUntil } from '../../../utils/waitUntil';
import { searchQueueForDone, searchQueueForError, searchQueueForErrorMsg } from '../../../utils/plc/serachQuery';

export class RTU_CreateConnection {
  private _instances: RTU_DeviceInstance;
  constructor(private readonly rtuDefinitions: RTU_ConnectionParamType) {
    this._instances = { id: 1, instance: new RTU_ConnectToDevice(...this.rtuDefinitions) };
  }

  public rtu_readFromDevice = (id: number[], tags: number[][]): MB_BeforeFormatRead[] => {
    const resp: MB_BeforeFormatRead[] = [];

    id.forEach((singleId, index) => {
      tags[index].forEach((tag) => {
        const currentTag = this._instances.instance.readBuffer.find((device) => device.uId === singleId)!.tags.find((searchTag) => searchTag.id === tag)!;
        const data: MB_BeforeFormatRead = {
          isError: currentTag.isError,
          status: currentTag.status,
          data: currentTag.data,
          id: currentTag.id,
          len: currentTag.params.len,
          format: currentTag.format,
          address: {
            deviceId: singleId,
            type: 'rtu',
            holdingRegister: currentTag.params.start,
            amount: currentTag.params.count,
          },
        };
        resp.push(data);
      });
    });

    return resp;
  };

  public rtu_writeToDevice = (dataToWrite: MB_AfterFormatWrite): void => {
    const idIndex: number = this._instances.instance.writeBufferConsistent.findIndex((device) => device.uId === dataToWrite.instanceId);

    dataToWrite.writeTags.forEach((tag) => {
      const tagIndex = this._instances.instance.writeBufferConsistent[idIndex].tags.findIndex((searchTag) => searchTag.id === tag.tagId);
      if (this._instances.instance.readBuffer[idIndex].tags[tagIndex].isError)
        throw new InternalError(this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].status);

      this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].execute = true;
      this._instances.instance.writeBufferConsistent[idIndex].tags[tagIndex].params.data = tag.data;
    });
  };

  public rtu_writeToDeviceSync = async (dataToWrite: MB_AfterFormatWrite): Promise<Partial<RTU_SyncQuery>> => {
    const query: RTU_SyncQuery = {
      queryId: nanoid(),
      uId: dataToWrite.instanceId,
      tags: dataToWrite.writeTags.map((tag) => tag.tagId),
      data: dataToWrite.writeTags.map((tag) => tag.data),
      isDone: false,
      isError: false,
      status: 'Not triggered',
    };

    this._instances.instance.addToSyncQueue(query);

    try {
      await waitUntil(
        () => searchQueueForDone(query.queryId, this._instances.instance.syncQueue),
        () => searchQueueForError(query.queryId, this._instances.instance.syncQueue),
        () => searchQueueForErrorMsg(query.queryId, this._instances.instance.syncQueue)
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
      this._instances.instance.removeFromSyncQueue(query.queryId);
    }
  };

  public get instances(): RTU_DeviceInstance {
    return this._instances;
  }
}

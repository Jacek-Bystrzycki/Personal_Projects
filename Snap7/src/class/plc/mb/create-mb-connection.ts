import { MB_ConnectToDevice } from './connect-to-devide';
import { MB_DeviceInstance } from '../../../types/plc/mb/mb-instances';
import { MB_ConnectionParamType } from '../../../types/plc/mb/conn-params';
import { BadRequestError, InternalError } from '../../../types/server/errors';
import { MB_BeforeFormatRead } from '../../../types/plc/mb/request';
import { nanoid } from 'nanoid';
import type { MB_SyncQuery } from '../../../types/plc/mb/syncQuery';
import { searchQueueForDone, searchQueueForError, searchQueueForErrorMsg } from '../../../utils/plc/serachQuery';
import { waitUntil } from '../../../utils/waitUntil';

export class MB_CreateConnections {
  private _instances: MB_DeviceInstance[];
  constructor(private readonly deviceDefinitions: MB_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): MB_DeviceInstance[] => {
    const instances = this.deviceDefinitions.map((item) => {
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
        const data: MB_BeforeFormatRead = {
          isError: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.isError,
          status: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.status,
          data: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.data,
          id: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.id,
          len: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.len,
          format: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.format,
          address: {
            deviceId: singleId,
            type: 'mb',
            holdingRegister: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params
              .start,
            amount: this._instances.find((id) => id.id === singleId)!.instance.readBufferConsistent.find((searchTag) => searchTag.id === tag)!.params.count,
          },
        };
        resp.push(data);
      });
    });

    return resp;
  };

  public mb_writeToDevice = (id: number, indexes: number[], dataToWrite: number[][]): void => {
    const dataIndex: number = this._instances.findIndex((item) => item.id === id);
    if (dataIndex === -1) throw new BadRequestError(`Instance ${id} not exists`);

    indexes.forEach((index, i) => {
      if (this._instances[dataIndex].instance.readBufferConsistent[index - 1].isError)
        throw new InternalError(this._instances[dataIndex].instance.writeBufferConsistent[index - 1].status);
      this._instances[dataIndex].instance.writeBufferConsistent[index - 1].execute = true;
      this._instances[dataIndex].instance.writeBufferConsistent[index - 1].params.data = dataToWrite[i];
    });
  };

  public mb_writeToDeviceSync = async (id: number, indexes: number[], dataToWrite: number[][]): Promise<void> => {
    const dataIndex: number = this._instances.findIndex((instance) => instance.id === id);

    const query: MB_SyncQuery = {
      queryId: nanoid(),
      indexes,
      data: dataToWrite,
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

  public get instances(): MB_DeviceInstance[] {
    return this._instances;
  }
}

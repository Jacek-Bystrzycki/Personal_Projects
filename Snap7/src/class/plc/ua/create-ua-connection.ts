import { UA_DeviceInstance } from '../../../types/plc/ua/ua-instances';
import { UA_ConnectionParamType } from '../../../types/plc/ua/conn-params';
import { UA_ConnectToDevice } from './connect-to-device';
import { UA_ReadFormat, UA_WriteFormat } from '../../../types/plc/ua/request';
import { DataType } from 'node-opcua-client';
import { UA_TagType } from '../../../types/plc/ua/format';
import { uaTransformReadValue } from '../../../utils/plc/ua/limitValue';
import { InternalError } from '../../../types/server/errors';
import { UA_SyncQuery } from '../../../types/plc/ua/syncQuery';
import { nanoid } from 'nanoid';
import { searchQueueForDone, searchQueueForError, searchQueueForErrorMsg } from '../../../utils/plc/serachQuery';
import { waitUntil } from '../../../utils/waitUntil';

export class UA_CreateConnections {
  private _instances: UA_DeviceInstance[];
  constructor(private readonly uaDefinitions: UA_ConnectionParamType[]) {
    this._instances = this.createConnections();
  }
  private createConnections = (): UA_DeviceInstance[] => {
    const instances = this.uaDefinitions.map((item) => {
      return new UA_ConnectToDevice(...item);
    });
    return instances.map((instance, index) => {
      return { id: index + 1, instance };
    });
  };

  public ua_readFromServer = (id: number[], tags: number[][]): UA_ReadFormat[] => {
    const resp: UA_ReadFormat[] = [];

    id.forEach((singleId, index) => {
      tags[index].forEach((tag) => {
        const currentTag = this._instances.find((id) => id.id === singleId)!.instance.readBuffer.find((searchTag) => searchTag.id === tag)!;
        const data: UA_ReadFormat = {
          deviceId: singleId,
          id: currentTag.id,
          type: 'ua',
          isError: currentTag.isError,
          status: currentTag.status,
          dataType: UA_CreateConnections.setDataType(currentTag.dataType),
          value: uaTransformReadValue(currentTag.data[0]),
        };
        resp.push(data);
      });
    });

    return resp;
  };

  public ua_writeToServer = (dataToWrite: UA_WriteFormat): void => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    dataToWrite.writeTags.forEach((tag) => {
      const tagIndex = this._instances[idIndex].instance.writeBuffer.findIndex((searchTag) => searchTag.id === tag.tagId);
      if (this._instances[idIndex].instance.readBuffer[tagIndex].isError)
        throw new InternalError(this._instances[idIndex].instance.writeBuffer[tagIndex].status);

      this._instances[idIndex].instance.writeBuffer[tagIndex].execute = true;
      this._instances[idIndex].instance.writeBuffer[tagIndex].data = tag.data;
    });
  };

  public ua_writToServerSync = async (dataToWrite: UA_WriteFormat): Promise<Partial<UA_SyncQuery>> => {
    const idIndex: number = this._instances.findIndex((instance) => instance.id === dataToWrite.instanceId);

    const query: UA_SyncQuery = {
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

  static setDataType = (type: DataType): UA_TagType => {
    switch (type) {
      case DataType.Boolean:
        return 'Boolean';
      case DataType.SByte:
        return 'SByte';
      case DataType.Byte:
        return 'Byte';
      case DataType.Int16:
        return 'Int16';
      case DataType.UInt16:
        return 'UInt16';
      case DataType.Int32:
        return 'Int32';
      case DataType.UInt32:
        return 'UInt32';
      case DataType.Float:
        return 'Float';
      case DataType.Double:
        return 'Double';
      default:
        throw new Error('Wrong Data type');
    }
  };

  public get instances(): UA_DeviceInstance[] {
    return this._instances;
  }
}

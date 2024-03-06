import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  DataValue,
  ConnectionStrategyOptions,
  OPCUAClientOptions,
  ClientSession,
  DataType,
  NodeId,
} from 'node-opcua-client';
import { setIntervalAsync } from 'set-interval-async/fixed';
import { uaLimitValue } from '../../../utils/plc/ua/limitValue';
import type { UA_ReadTag, UA_WriteTag } from '../../../types/plc/ua/tags';
import type { UA_TagDef, UA_TagType } from '../../../types/plc/ua/format';
import { BadRequestError } from '../../../types/server/errors';

export class UA_ConnectToDevice {
  private _client: OPCUAClient;
  private _options: OPCUAClientOptions;
  private _connStrategy: ConnectionStrategyOptions;
  private _readBuffer: UA_ReadTag[];
  private _writeBuffer: UA_WriteTag[];
  constructor(private readonly endpointUrl: string, private readonly tagsDefs: UA_TagDef[]) {
    this._connStrategy = {
      initialDelay: 100,
      maxRetry: 100,
      maxDelay: 200,
    };
    this._options = {
      applicationName: 'OPC-UA-Client',
      connectionStrategy: this._connStrategy,
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false,
    };
    this._client = OPCUAClient.create(this._options);
    this._readBuffer = this.tagsDefs.map((tagDef): UA_ReadTag => {
      return {
        id: tagDef.id,
        nodeId: NodeId.resolveNodeId(tagDef.nodeId),
        data: null,
        dataType: this.getDataType(tagDef.dataType),
        isError: true,
        status: 'Bad. Init Conn.',
      };
    });
    this._writeBuffer = this.tagsDefs.map((tagDef): UA_WriteTag => {
      return {
        id: tagDef.id,
        execute: false,
        nodeId: NodeId.resolveNodeId(tagDef.nodeId),
        dataType: this.getDataType(tagDef.dataType),
        data: null,
        isError: true,
        status: 'Bad. Init Conn.',
      };
    });
    this.loop();
  }

  private loop = (): void => {
    setIntervalAsync(async () => {
      try {
        await this.connectToServer();
        const session = await this._client.createSession();
        //====READ======
        for (const tag of this._readBuffer) {
          try {
            const { data, isError, status } = await this.readTag(session, tag);
            tag.data = data;
            tag.isError = isError;
            tag.status = status;
          } catch (error) {
            tag.data = null;
            tag.isError = true;
            if (error instanceof BadRequestError) {
              tag.status = error.message;
            } else tag.status = 'Bad';
          }
        }
        //====WRTIE=====
        for (const [index, tag] of this._writeBuffer.entries()) {
          if (tag.execute) {
            tag.execute = false;
            const { isError, status } = await this.writeTag(session, tag, this._readBuffer[index]);
            tag.isError = isError;
            tag.status = status;
          }
        }
        await session.close();
      } catch (error) {
        this._readBuffer.forEach((tag) => {
          tag.data = null;
          tag.isError = true;
          tag.status = 'BadCommunicationError';
        });
      } finally {
        await this._client.disconnect();
      }
    }, 100);
  };

  private connectToServer = async (): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      this._client
        .connect(this.endpointUrl)
        .then(() => resolve())
        .catch(() => {
          reject(new Error('Connection Error!'));
        });
    });
    const timeout = new Promise<never>((_, rej) => {
      setTimeout(() => {
        rej(new Error('Reconnect Timeout!'));
      }, 3000);
    });
    return Promise.race([promise, timeout]);
  };

  private readTag = async (session: ClientSession, readTag: UA_ReadTag): Promise<{ data: number | boolean; isError: boolean; status: string }> => {
    const data: DataValue = await session.read({
      nodeId: readTag.nodeId,
      attributeId: AttributeIds.Value,
    });
    if (data.value.dataType === readTag.dataType) {
      return {
        data: data.value.toJSON().value,
        isError: !data.statusCode.isGood(),
        status: data.statusCode.name,
      };
    } else throw new BadRequestError(`Bad_TypeMismatch ReadTag: ${readTag.nodeId}`);
  };

  private writeTag = async (session: ClientSession, writeTag: UA_WriteTag, readTag: UA_ReadTag): Promise<{ isError: boolean; status: string }> => {
    if (writeTag.dataType === readTag.dataType && writeTag.data) {
      try {
        await session.write({
          nodeId: writeTag.nodeId,
          attributeId: AttributeIds.Value,
          value: {
            value: {
              dataType: writeTag.dataType,
              value: uaLimitValue(writeTag.data, writeTag.dataType),
            },
          },
        });
      } catch (error) {
        if (error instanceof BadRequestError) {
          throw new BadRequestError(error.message);
        } else throw new BadRequestError('WriteTag - Unknown error');
      }
      return {
        isError: readTag.isError,
        status: readTag.status,
      };
    } else throw new BadRequestError(`Bad_TypeMismatch WriteTag: ${readTag.nodeId}`);
  };

  private getDataType = (type: UA_TagType): DataType => {
    switch (type) {
      case 'Boolean':
        return DataType.Boolean;
      case 'SByte':
        return DataType.SByte;
      case 'Byte':
        return DataType.Byte;
      case 'Int16':
        return DataType.Int16;
      case 'UInt16':
        return DataType.UInt16;
      case 'Int32':
        return DataType.Int32;
      case 'UInt32':
        return DataType.UInt32;
      case 'Float':
        return DataType.Float;
      case 'Double':
        return DataType.Double;
      default:
        throw new Error('Wrong Data type');
    }
  };
  public get readBuffer(): UA_ReadTag[] {
    return this._readBuffer;
  }

  public get writeBuffer(): UA_WriteTag[] {
    return this._writeBuffer;
  }

  public set writeBuffer(data: UA_WriteTag[]) {
    this._writeBuffer = data;
  }
}

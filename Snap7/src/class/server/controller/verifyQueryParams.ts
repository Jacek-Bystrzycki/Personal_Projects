import { BadRequestError } from '../../../types/server/errors';
import { Request } from 'express';
import { S7_CreateConnections } from '../../plc/s7/create-plc-connections';
import { MB_CreateConnections } from '../../plc/mb/create-mb-connection';

export const verifyParams = (req: Request, instance: S7_CreateConnections | MB_CreateConnections): { idArr: number[]; numTags: number[][] } | undefined => {
  const { id } = req.params;
  const { tags } = req.query;

  let idArr: number[] = [];
  if (id) {
    idArr = id.split(',').map((id) => parseInt(id, 10));
    if (!idArr.every((id) => !isNaN(id))) throw new BadRequestError("'Ids' needs to be a number");
    idArr.forEach((id) => {
      if (!instance.instances[id - 1]) throw new BadRequestError(`Instance ${id} not exists`);
    });
  } else {
    for (let i = 0; i < instance.instances.length; i++) idArr.push(i + 1);
  }
  //======================
  const queryExists: boolean = Object.keys(req.query).length > 0;
  let numTags: number[][] = [];
  if (queryExists) {
    if (typeof tags !== 'string') throw new BadRequestError("'tags' missing in query");
    try {
      {
        const tempTags = tags.split(';').map((item) => {
          return JSON.parse(item);
        });
        numTags = tempTags;
      }
    } catch (error) {
      throw new BadRequestError('Tags needs to ba array of numbers');
    }
    if (numTags.length !== idArr.length) throw new BadRequestError('Wrong amount of tags');
  } else {
    idArr.forEach((id) => {
      const tempTags: number[] = [];
      for (let i = 0; i < instance.instances[id - 1].instance.readBufferConsistent.length; i++) {
        tempTags.push(i + 1);
      }
      numTags.push(tempTags);
    });
  }

  //======================
  let wrongTags: number[][] = [];
  numTags.forEach((id, index) => {
    const tempWrongTags: number[] = [];
    const curId = idArr[index] - 1;
    id.forEach((tag) => {
      if (typeof instance.instances[curId].instance.readBufferConsistent[tag - 1] === 'undefined') {
        tempWrongTags.push(tag);
      }
    });
    wrongTags.push(tempWrongTags);
  });

  if (!wrongTags.every((id) => id.length === 0)) {
    throw new BadRequestError(`Not all tags ${JSON.stringify(wrongTags)} exist in params definitions`);
  }

  return { idArr, numTags };
};

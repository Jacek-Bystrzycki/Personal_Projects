import { BadRequestError } from '../../../types/server/errors';
import { Request } from 'express';
import { S7_CreateConnections } from '../../plc/s7/create-plc-connections';
import { MB_CreateConnections } from '../../plc/mb/create-mb-connection';

export const verifyParams = (req: Request, instance: S7_CreateConnections | MB_CreateConnections): { numId: number; numTags: number[] } | undefined => {
  const { id } = req.params;
  const { tags } = req.query;
  const queryExists: boolean = Object.keys(req.query).length > 0;

  if (isNaN(parseInt(id, 10))) throw new BadRequestError("'Id' needs to be a number");
  const numId: number = parseInt(id, 10);
  if (!instance.instances[numId - 1]) throw new BadRequestError(`Instance ${numId} not exists`);
  let numTags: number[];
  if (queryExists) {
    if (typeof tags !== 'string') throw new BadRequestError("'tags' missing in query");
    try {
      numTags = JSON.parse(tags);
    } catch (error) {
      throw new BadRequestError('Tags needs to ba array of numbers');
    }
    if (!Array.isArray(numTags) || !numTags.every((tag) => typeof tag === 'number') || numTags.length < 1)
      throw new BadRequestError('Tags needs to ba array of numbers');
  } else {
    numTags = instance.instances[numId - 1].instance.readBufferConsistent.map((tag) => tag.id);
  }
  let wrongTags: number[] = [];
  numTags.forEach((tag) => {
    if (typeof instance.instances[numId - 1].instance.readBufferConsistent[tag - 1] === 'undefined') {
      wrongTags.push(tag);
    }
  });
  if (wrongTags.length > 0) throw new BadRequestError(`Not all tags [${wrongTags}] exist in params definitions`);
  return { numId, numTags };
};

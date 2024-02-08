import snap7 = require('node-snap7');

export type ReadBuffer = {
  params: snap7.MultiVarRead;
  data: Buffer;
};

export type WriteBuffer = {
  params: snap7.MultiVarWrite;
  execute: boolean;
};

const { readPLC, writePLC, createCustomError } = require('./plc-query.js');
const { Buffer } = require('node:buffer');
const { getGlobal } = require('./global.js');

const readQuery = async (req, res, next) => {
  const dbNo = Number(req.params.dbNo);
  const start = Number(req.params.start);
  const size = Number(req.params.size);
  if (getGlobal('plcIsConnected')) {
    try {
      const recvBuffer = await readPLC(dbNo, start, size);
      res.status(200).json({ status: 'success', recvBuffer });
    } catch (error) {
      next(error);
    }
  } else {
    next(createCustomError('No active connection to PLC...', 503));
  }
};

const writeQuery = async (req, res, next) => {
  const data = req.body.data;
  const dbNo = Number(req.params.dbNo);
  const start = Number(req.params.start);
  const size = Number(req.params.size);
  const sendBuffer = Buffer.from(data.data);
  if (getGlobal('plcIsConnected')) {
    try {
      await writePLC(dbNo, start, size, sendBuffer);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  } else {
    next(createCustomError('No active connection to PLC...', 503));
  }
};

module.exports = { readQuery, writeQuery };

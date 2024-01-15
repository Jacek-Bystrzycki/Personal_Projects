const { s7client } = require('./plc-connect.js');

class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createCustomError = (message, statusCode) => {
  return new CustomAPIError(message, statusCode);
};

const readPLC = (dbNo, start, size) => {
  return new Promise((resolve, reject) => {
    const data = s7client.DBRead(dbNo, start, size);
    if (!data) {
      reject(
        createCustomError(
          `Error while reading P#DB${dbNo}.DBX${start}.0 BYTE ${size}`,
          400
        )
      );
    } else {
      resolve(data);
    }
  });
};

const writePLC = (dbNo, start, size, buffer) => {
  return new Promise((resolve, reject) => {
    const writeOK = s7client.DBWrite(dbNo, start, size, buffer);
    if (!writeOK) {
      reject(
        createCustomError(
          `Error while writing P#DB${dbNo}.DBX${start}.0 BYTE ${size}`,
          400
        )
      );
    } else {
      resolve();
    }
  });
};

module.exports = { readPLC, writePLC, createCustomError, CustomAPIError };

const snap7 = require('node-snap7');
const { setGlobal } = require('./global.js');
const { plcReconnectInterval } = require('./connections-params.js');

const s7client = new snap7.S7Client();

const connectPLC = (ip, rack, slot) => {
  return new Promise((resolve, reject) => {
    const isConnected = s7client.ConnectTo(ip, rack, slot);
    if (isConnected) {
      resolve(`Connected to PLC at ${ip}, rack: ${rack}, slot: ${slot}.`);
    } else {
      reject(`Lost connection to PLC ${ip}, rack: ${rack}, slot: ${slot}.`);
    }
  });
};

const connectionCheck = () => {
  return new Promise((resolve, reject) => {
    const dataTime = s7client.GetPlcDateTime();
    if (dataTime instanceof Date) {
      resolve();
    } else {
      reject();
    }
  });
};

const controlPlcConnection = (ip, rack, slot) => {
  let lostConMsg = true;
  setInterval(async () => {
    try {
      await connectionCheck();
      setGlobal('plcIsConnected', true);
    } catch (error) {
      try {
        const isConnected = await connectPLC(ip, rack, slot);
        console.log(isConnected);
        lostConMsg = true;
      } catch (error) {
        if (lostConMsg) console.log(error);
        lostConMsg = false;
        setGlobal('plcIsConnected', false);
      }
    }
  }, plcReconnectInterval);
};

module.exports = { controlPlcConnection, s7client };

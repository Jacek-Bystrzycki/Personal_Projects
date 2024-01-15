//Server connection parameters
const srvRoute = '/api/v1/';
const srvPort = 5000;

//PLC connection parameters
const plcIp = '192.168.204.130';
const plcRack = 0;
const plcSlot = 1;
const plcReconnectInterval = 3000; //[ms]

module.exports = {
  srvRoute,
  srvPort,
  plcIp,
  plcRack,
  plcSlot,
  plcReconnectInterval,
};

const globals = {
  plcIsConnected: {
    value: true,
  },
};

getGlobal = function (global) {
  return globals?.[global]?.value;
};

setGlobal = function (global, value) {
  if (globals?.[global]) {
    return (globals[global].value = value);
  }
};

module.exports = { getGlobal, setGlobal };

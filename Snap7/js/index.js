const express = require('express');
const morgan = require('morgan');
const app = express();
const routes = require('./routes.js');
const customErrorHandler = require('./error-handler.js');
const {
  srvRoute,
  srvPort,
  plcIp,
  plcRack,
  plcSlot,
} = require('./connections-params.js');
const { controlPlcConnection } = require('./plc-connect.js');

app.use(express.json());
// app.use(morgan('tiny'));
app.use(srvRoute, routes);

app.all('*', (req, res) => {
  res.status(404).send('Page not found...');
});

app.use(customErrorHandler);

app.listen(srvPort, () => {
  console.log(`Server is listening at "localhost:${srvPort}${srvRoute}"`);
});

controlPlcConnection(plcIp, plcRack, plcSlot);

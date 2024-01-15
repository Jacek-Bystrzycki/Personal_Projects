import express, { Express, Request, Response } from 'express';
const cors = require('cors');
require('dotenv').config();
// const connectDB = require('./db/connect');
import connectDB from './db/connect';
import { router } from './routes/items';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/tasks', router);

app.all('*', (req: Request, res: Response) => {
  res.status(200).send('Wrong endpoint!!!');
});

const start = async (uri: string): Promise<void> => {
  try {
    await connectDB(uri);
    app.listen(5000, (): void => {
      console.log('Server is listening on port 5000...');
    });
  } catch (error) {}
};

const url: string = process.env.MONGO_URI as string;
start(url);

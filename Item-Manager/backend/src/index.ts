import express, { Express, Request, Response } from 'express';
const cors = require('cors');
require('dotenv').config();
import connectDB from './db/connect';
import { router } from './routes/items';
import path from 'path';

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public/dist')));

app.use('/api/v1/tasks', router);

app.all('*', (req: Request, res: Response) => {
  res.status(200).sendFile(path.resolve(__dirname, './public/dist', 'index.html'));
});

const start = async (uri: string): Promise<void> => {
  try {
    await connectDB(uri);
    app.listen(5000, (): void => {
      console.log('Server is listening on port 5000...');
      console.log('http://localhost:5000/index.html');
    });
  } catch (error) {}
};

const url: string = process.env.MONGO_URI as string;
start(url);

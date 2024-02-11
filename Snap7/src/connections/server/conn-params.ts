import dotenv from 'dotenv';
dotenv.config();

type ConnType = 'S7' | 'MB';
type QueryPath = '/api/v1/s7' | '/api/v1/mb';
type RoutesTypes = Record<ConnType, QueryPath>;
export const mainPaths: RoutesTypes = {
  S7: '/api/v1/s7',
  MB: '/api/v1/mb',
};
export type PathType = '/' | '/read/:id' | '/write/:id' | '/writesync/:id';
export type RequestTypes = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

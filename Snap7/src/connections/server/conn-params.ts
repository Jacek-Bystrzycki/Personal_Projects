import dotenv from 'dotenv';
dotenv.config();

type RequestType = 'AllTags' | 'S7Tags' | 'MBTags' | 'RTUTags';
type RequestPath = '/api/v1/tags/read' | '/api/v1/tags/s7' | '/api/v1/tags/mb' | '/api/v1/tags/rtu';

type RoutesTypes = Record<RequestType, RequestPath>;
export const mainPaths: RoutesTypes = {
  AllTags: '/api/v1/tags/read',
  S7Tags: '/api/v1/tags/s7',
  MBTags: '/api/v1/tags/mb',
  RTUTags: '/api/v1/tags/rtu',
};

export type PathType = '/' | '/read' | '/read/:id' | '/write/:id' | '/writesync/:id';

export type RequestTypes = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

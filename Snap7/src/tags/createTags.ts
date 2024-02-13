import Excel from 'exceljs';
import path from 'path';
import snap7 = require('node-snap7');
import type { S7_Tags, S7_ReadTagDef, S7_WriteTagDef, S7_Format } from '../types/plc/s7/format';
import { s7_format } from '../types/plc/s7/format';

const getCellValue = (row: Excel.Row, cellIndex: number): string => {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : '0';
};

const getS7Area = (data: string): snap7.Area => {
  if (data === 'DB') {
    return snap7.Area.S7AreaDB;
  }
  throw new Error('Wrong S7 Area');
};
const getS7WordLen = (data: string): snap7.WordLen => {
  switch (data) {
    case 'Bit':
      return snap7.WordLen.S7WLBit;
    case 'Byte':
      return snap7.WordLen.S7WLByte;
    case 'Word':
      return snap7.WordLen.S7WLWord;
    case 'Dword':
      return snap7.WordLen.S7WLDWord;
    case 'Real':
      return snap7.WordLen.S7WLReal;
    default:
      throw new Error(`Wrong S7 WordLen`);
  }
};

const getS7Format = (data: string): S7_Format => {
  if (s7_format.includes(data as any)) {
    return data as S7_Format;
  }
  throw new Error(`Wrong S7 Format`);
};

const createS7ReadTags = async (file: string): Promise<S7_ReadTagDef[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[0];
  const rowStartIndex = 4;

  const rows = worksheet.getRows(rowStartIndex, 1003) ?? [];
  const noEmptyRows: Excel.Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (
      rows[i].getCell(3).value &&
      rows[i].getCell(4).value &&
      rows[i].getCell(5).value !== 'undefined' &&
      rows[i].getCell(6).value &&
      rows[i].getCell(7).value
    )
      noEmptyRows.push(rows[i]);
    else break;
  }

  const tags: S7_ReadTagDef[] = noEmptyRows.map((row, index): S7_ReadTagDef => {
    const amount: number = parseInt(getCellValue(row, 7), 10);
    if (amount < 1) throw new Error('Wrong Amount');
    return {
      params: {
        Area: getS7Area(getCellValue(row, 2)),
        WordLen: getS7WordLen(getCellValue(row, 3)),
        DBNumber: parseInt(getCellValue(row, 4), 10),
        Start: parseInt(getCellValue(row, 5), 10),
        Amount: getS7WordLen(getCellValue(row, 3)) === snap7.WordLen.S7WLBit ? 1 : amount,
      },
      format: getS7Format(getCellValue(row, 6)),
      id: index + 1,
    };
  });
  return tags;
};

const createS7WriteTags = async (file: string): Promise<S7_WriteTagDef[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[0];
  const rowStartIndex = 4;
  const rows = worksheet.getRows(rowStartIndex, 1003) ?? [];
  const noEmptyRows: Excel.Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (
      rows[i].getCell(3).value &&
      rows[i].getCell(4).value &&
      rows[i].getCell(5).value !== 'undefined' &&
      rows[i].getCell(6).value &&
      rows[i].getCell(7).value
    )
      noEmptyRows.push(rows[i]);
    else break;
  }

  const tags: S7_WriteTagDef[] = noEmptyRows.map((row, index): S7_WriteTagDef => {
    const amount: number = parseInt(getCellValue(row, 7), 10);
    if (amount < 1) throw new Error('Wrong Amount');
    return {
      params: {
        Area: getS7Area(getCellValue(row, 2)),
        WordLen: getS7WordLen(getCellValue(row, 3)),
        DBNumber: parseInt(getCellValue(row, 4), 10),
        Start: parseInt(getCellValue(row, 5), 10),
        Amount: getS7WordLen(getCellValue(row, 3)) === snap7.WordLen.S7WLBit ? 1 : amount,
        Data: Buffer.from([]),
      },
      format: getS7Format(getCellValue(row, 6)),
      id: index + 1,
    };
  });
  return tags;
};

export const createS7Tags = async (file: string): Promise<S7_Tags> => {
  const read: S7_ReadTagDef[] = await createS7ReadTags(file);
  const write: S7_WriteTagDef[] = await createS7WriteTags(file);
  return { read, write };
};

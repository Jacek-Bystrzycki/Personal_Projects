import Excel from 'exceljs';
import path from 'path';
import snap7 = require('node-snap7');

const getArea = (data: string): snap7.Area => {
  if (data === 'DB') {
    return snap7.Area.S7AreaDB;
  }
  throw new Error('Wrong Area');
};
const getWordLen = (data: string): snap7.WordLen => {
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
      throw new Error(`Wrong WordLen`);
  }
};

const getCellValue = (row: Excel.Row, cellIndex: number): string => {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : '0';
};

export const createS7ReadTags = async (file: string, numberOfTags: number): Promise<snap7.MultiVarRead[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[0];
  const rowStartIndex = 4;

  const rows = worksheet.getRows(rowStartIndex, numberOfTags) ?? [];

  const tags = rows.map((row): snap7.MultiVarRead => {
    const amount: number = parseInt(getCellValue(row, 6), 10);
    if (amount < 1) throw new Error('Wrong Amount');
    return {
      Area: getArea(getCellValue(row, 2)),
      WordLen: getWordLen(getCellValue(row, 3)),
      DBNumber: parseInt(getCellValue(row, 4), 10),
      Start: parseInt(getCellValue(row, 5), 10),
      Amount: amount,
    };
  });
  return tags;
};

export const createS7WriteTags = async (file: string, numberOfTags: number): Promise<snap7.MultiVarWrite[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[1];
  const rowStartIndex = 4;
  const rows = worksheet.getRows(rowStartIndex, numberOfTags) ?? [];

  const tags = rows.map((row): snap7.MultiVarWrite => {
    const amount: number = parseInt(getCellValue(row, 6), 10);
    if (amount < 1) throw new Error('Wrong Amount');
    return {
      Area: getArea(getCellValue(row, 2)),
      WordLen: getWordLen(getCellValue(row, 3)),
      DBNumber: parseInt(getCellValue(row, 4), 10),
      Start: parseInt(getCellValue(row, 5), 10),
      Amount: amount,
      Data: Buffer.from([0]),
    };
  });
  return tags;
};

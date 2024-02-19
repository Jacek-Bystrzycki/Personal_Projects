import Excel from 'exceljs';
import path from 'path';
import type { MB_Area, MB_TagType, MB_Format, MB_TagDef } from '../types/plc/mb/format';
import { mb_tagType, mb_format } from '../types/plc/mb/format';

const getCellValue = (row: Excel.Row, cellIndex: number): string => {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : '0';
};

const getMBArea = (data: string): MB_Area => {
  if (data === 'HoldingRegister') {
    return data;
  }
  throw new Error('Wrong MB Area');
};

const getMBType = (data: string): MB_TagType => {
  if (mb_tagType.includes(data as any)) {
    return data as MB_TagType;
  }
  throw new Error('Wrong Modbus type');
};

const getMBFormat = (data: string): MB_Format => {
  if (mb_format.includes(data as any)) {
    return data as MB_Format;
  }
  throw new Error('Wrong Modbus type');
};

export const createMBTags = async (file: string): Promise<MB_TagDef[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[0];
  const rowStartIndex = 4;

  const rows = worksheet.getRows(rowStartIndex, 1003) ?? [];
  const noEmptyRows: Excel.Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].getCell(3).value && rows[i].getCell(4).value !== 'undefined' && rows[i].getCell(5).value && rows[i].getCell(6).value) noEmptyRows.push(rows[i]);
    else break;
  }

  const tags: MB_TagDef[] = noEmptyRows.map((row, index): MB_TagDef => {
    const amount: number = parseInt(getCellValue(row, 5), 10);
    if (amount < 1) throw new Error('Wrong Amount');
    return {
      params: {
        area: getMBArea(getCellValue(row, 2)),
        len: getMBType(getCellValue(row, 3)),
        start: parseInt(getCellValue(row, 4), 10),
        count: getMBType(getCellValue(row, 3)) === 'Bit' ? 1 : amount,
        data: [],
      },
      id: index + 1,
      format: getMBFormat(getCellValue(row, 6)),
    };
  });
  return tags;
};

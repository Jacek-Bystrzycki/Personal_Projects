import Excel from 'exceljs';
import path from 'path';
import type { UA_TagDef, UA_TagType } from '../types/plc/ua/format';
import { ua_tagType } from '../types/plc/ua/format';

const getCellValue = (row: Excel.Row, cellIndex: number): string => {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : '0';
};

const getUANodeId = (row: Excel.Row, cellIndex: number): string => {
  const cell = row.getCell(cellIndex).result;
  if (typeof cell === 'string') return cell;
  else throw new Error('Wrong OPC UA NodeId');
};

const getUAType = (data: string): UA_TagType => {
  if (ua_tagType.includes(data as any)) {
    return data as UA_TagType;
  }
  throw new Error('Wrong OPC UA data type');
};

export const createUATags = async (file: string): Promise<UA_TagDef[]> => {
  const filePath = path.resolve(__dirname, file);
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filePath);

  const worksheet = content.worksheets[0];
  const rowStartIndex = 4;

  const rows = worksheet.getRows(rowStartIndex, 1003) ?? [];
  const noEmptyRows: Excel.Row[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].getCell(3).value && rows[i].getCell(4).value && rows[i].getCell(5).value) noEmptyRows.push(rows[i]);
    else break;
  }

  const tags: UA_TagDef[] = noEmptyRows.map((row, index): UA_TagDef => {
    return {
      id: index + 1,
      nodeId: getUANodeId(row, 2),
      dataType: getUAType(getCellValue(row, 5)),
    };
  });
  return tags;
};

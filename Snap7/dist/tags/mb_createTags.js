"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMBTags = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const format_1 = require("../types/plc/mb/format");
const getCellValue = (row, cellIndex) => {
    const cell = row.getCell(cellIndex);
    return cell.value ? cell.value.toString() : '0';
};
const getMBArea = (data) => {
    if (data === 'HoldingRegister') {
        return data;
    }
    throw new Error('Wrong MB Area');
};
const getMBType = (data) => {
    if (format_1.mb_tagType.includes(data)) {
        return data;
    }
    throw new Error('Wrong Modbus type');
};
const getMBFormat = (data) => {
    if (format_1.mb_format.includes(data)) {
        return data;
    }
    throw new Error('Wrong Modbus type');
};
const createMBTags = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = path_1.default.resolve(__dirname, file);
    const workbook = new exceljs_1.default.Workbook();
    const content = yield workbook.xlsx.readFile(filePath);
    const worksheet = content.worksheets[0];
    const rowStartIndex = 4;
    const rows = (_a = worksheet.getRows(rowStartIndex, 1003)) !== null && _a !== void 0 ? _a : [];
    const noEmptyRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].getCell(3).value && rows[i].getCell(4).value !== 'undefined' && rows[i].getCell(5).value && rows[i].getCell(6).value)
            noEmptyRows.push(rows[i]);
        else
            break;
    }
    const tags = noEmptyRows.map((row, index) => {
        const amount = parseInt(getCellValue(row, 5), 10);
        if (amount < 1)
            throw new Error('Wrong Amount');
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
});
exports.createMBTags = createMBTags;

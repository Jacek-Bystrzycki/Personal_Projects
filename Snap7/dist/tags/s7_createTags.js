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
exports.createS7Tags = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const format_1 = require("../types/plc/s7/format");
const getCellValue = (row, cellIndex) => {
    const cell = row.getCell(cellIndex);
    return cell.value ? cell.value.toString() : '0';
};
const getS7Area = (data) => {
    if (data === 'DB') {
        return 132 /* snap7.Area.S7AreaDB */;
    }
    throw new Error('Wrong S7 Area');
};
const getS7WordLen = (data) => {
    switch (data) {
        case 'Bit':
            return 1 /* snap7.WordLen.S7WLBit */;
        case 'Byte':
            return 2 /* snap7.WordLen.S7WLByte */;
        case 'Word':
            return 4 /* snap7.WordLen.S7WLWord */;
        case 'Dword':
            return 6 /* snap7.WordLen.S7WLDWord */;
        case 'Real':
            return 8 /* snap7.WordLen.S7WLReal */;
        default:
            throw new Error(`Wrong S7 WordLen`);
    }
};
const getS7Format = (data) => {
    if (format_1.s7_format.includes(data)) {
        return data;
    }
    throw new Error(`Wrong S7 Format`);
};
const createS7ReadTags = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = path_1.default.resolve(__dirname, file);
    const workbook = new exceljs_1.default.Workbook();
    const content = yield workbook.xlsx.readFile(filePath);
    const worksheet = content.worksheets[0];
    const rowStartIndex = 4;
    const rows = (_a = worksheet.getRows(rowStartIndex, 1003)) !== null && _a !== void 0 ? _a : [];
    const noEmptyRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].getCell(3).value &&
            rows[i].getCell(4).value &&
            rows[i].getCell(5).value !== 'undefined' &&
            rows[i].getCell(6).value &&
            rows[i].getCell(7).value)
            noEmptyRows.push(rows[i]);
        else
            break;
    }
    const tags = noEmptyRows.map((row, index) => {
        const amount = parseInt(getCellValue(row, 7), 10);
        if (amount < 1)
            throw new Error('Wrong Amount');
        return {
            params: {
                Area: getS7Area(getCellValue(row, 2)),
                WordLen: getS7WordLen(getCellValue(row, 3)),
                DBNumber: parseInt(getCellValue(row, 4), 10),
                Start: parseInt(getCellValue(row, 5), 10),
                Amount: getS7WordLen(getCellValue(row, 3)) === 1 /* snap7.WordLen.S7WLBit */ ? 1 : amount,
            },
            format: getS7Format(getCellValue(row, 6)),
            id: index + 1,
        };
    });
    return tags;
});
const createS7WriteTags = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const filePath = path_1.default.resolve(__dirname, file);
    const workbook = new exceljs_1.default.Workbook();
    const content = yield workbook.xlsx.readFile(filePath);
    const worksheet = content.worksheets[0];
    const rowStartIndex = 4;
    const rows = (_b = worksheet.getRows(rowStartIndex, 1003)) !== null && _b !== void 0 ? _b : [];
    const noEmptyRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].getCell(3).value &&
            rows[i].getCell(4).value &&
            rows[i].getCell(5).value !== 'undefined' &&
            rows[i].getCell(6).value &&
            rows[i].getCell(7).value)
            noEmptyRows.push(rows[i]);
        else
            break;
    }
    const tags = noEmptyRows.map((row, index) => {
        const amount = parseInt(getCellValue(row, 7), 10);
        if (amount < 1)
            throw new Error('Wrong Amount');
        return {
            params: {
                Area: getS7Area(getCellValue(row, 2)),
                WordLen: getS7WordLen(getCellValue(row, 3)),
                DBNumber: parseInt(getCellValue(row, 4), 10),
                Start: parseInt(getCellValue(row, 5), 10),
                Amount: getS7WordLen(getCellValue(row, 3)) === 1 /* snap7.WordLen.S7WLBit */ ? 1 : amount,
                Data: Buffer.from([]),
            },
            format: getS7Format(getCellValue(row, 6)),
            id: index + 1,
        };
    });
    return tags;
});
const createS7Tags = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const read = yield createS7ReadTags(file);
    const write = yield createS7WriteTags(file);
    return { read, write };
});
exports.createS7Tags = createS7Tags;

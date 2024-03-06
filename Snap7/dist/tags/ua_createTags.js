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
exports.createUATags = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const format_1 = require("../types/plc/ua/format");
const getCellValue = (row, cellIndex) => {
    const cell = row.getCell(cellIndex);
    return cell.value ? cell.value.toString() : '0';
};
const getUANodeId = (row, cellIndex) => {
    const cell = row.getCell(cellIndex).result;
    if (typeof cell === 'string')
        return cell;
    else
        throw new Error('Wrong OPC UA NodeId');
};
const getUAType = (data) => {
    if (format_1.ua_tagType.includes(data)) {
        return data;
    }
    throw new Error('Wrong OPC UA data type');
};
const createUATags = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = path_1.default.resolve(__dirname, file);
    const workbook = new exceljs_1.default.Workbook();
    const content = yield workbook.xlsx.readFile(filePath);
    const worksheet = content.worksheets[0];
    const rowStartIndex = 4;
    const rows = (_a = worksheet.getRows(rowStartIndex, 1003)) !== null && _a !== void 0 ? _a : [];
    const noEmptyRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].getCell(3).value && rows[i].getCell(4).value && rows[i].getCell(5).value)
            noEmptyRows.push(rows[i]);
        else
            break;
    }
    const tags = noEmptyRows.map((row, index) => {
        return {
            id: index + 1,
            nodeId: getUANodeId(row, 2),
            dataType: getUAType(getCellValue(row, 5)),
        };
    });
    return tags;
});
exports.createUATags = createUATags;

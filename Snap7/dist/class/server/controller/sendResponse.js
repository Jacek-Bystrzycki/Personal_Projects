"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const http_status_codes_1 = require("http-status-codes");
const get_date_as_string_1 = require("../../../utils/get-date-as-string");
const sendResponse = (req, res, next) => {
    try {
        let resp = [];
        if (res.s7Tags) {
            resp = [...resp, ...res.s7Tags];
        }
        if (res.mbTags) {
            resp = [...resp, ...res.s7Tags];
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({ message: `${(0, get_date_as_string_1.getDateAsString)()}Success`, amount: resp.length, response: resp });
    }
    catch (error) {
        next(error);
    }
};
exports.sendResponse = sendResponse;

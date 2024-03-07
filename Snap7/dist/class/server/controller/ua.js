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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UA_Controller = void 0;
const errors_1 = require("../../../types/server/errors");
class UA_Controller {
    constructor(instance) {
        this.instance = instance;
        this.verifyUAParams = (req, res, next) => {
            try {
                const { idArr, numTags } = this.verifyParams(req);
                req.id = idArr;
                req.tags = numTags;
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyUAPayload = (req, res, next) => { };
        this.read = (req, res, next) => {
            try {
                res.uaTags = this.instance.ua_readFromServer(req.id, req.tags);
                next();
            }
            catch (error) {
                next(error);
            }
        };
        this.write = (req, res, next) => { };
        this.writeSync = (req, res, next) => __awaiter(this, void 0, void 0, function* () { });
        this.verifyParams = (req) => {
            const { id } = req.params;
            const { tags } = req.query;
            let idArr = [];
            if (id) {
                try {
                    idArr = JSON.parse(id);
                }
                catch (error) {
                    throw new errors_1.BadRequestError("'Ids' needs to be an array of numbers");
                }
                if (!Array.isArray(idArr) || !idArr.every((id) => !isNaN(id)))
                    throw new errors_1.BadRequestError("'Ids' needs to be an array of numbers");
                idArr.forEach((id) => {
                    if (this.instance.instances[id - 1])
                        throw new errors_1.BadRequestError(`Instance ${id} not exists`);
                });
            }
            else {
                for (let i = 0; i < this.instance.instances.length; i++)
                    idArr.push(i + 1);
            }
            //======================
            const queryExists = Object.keys(req.query).length > 0;
            let numTags = [];
            if (queryExists) {
                if (typeof tags !== 'string')
                    throw new errors_1.BadRequestError("'tags' missing in query");
                try {
                    const tempTags = JSON.parse(tags);
                    if (!Array.isArray(tempTags) || !tempTags.every((item) => Array.isArray(item)))
                        throw new errors_1.BadRequestError('Tags needs to ba an array of array of numbers');
                    numTags = tempTags;
                }
                catch (error) {
                    throw new errors_1.BadRequestError('Tags needs to ba an array of array of numbers');
                }
                if (numTags.length !== idArr.length)
                    throw new errors_1.BadRequestError('Wrong amount of tags');
            }
            else {
                idArr.forEach((id) => {
                    const tempTags = [];
                    for (let i = 0; i < this.instance.instances[id - 1].instance.readBuffer.length; i++) {
                        tempTags.push(i + 1);
                    }
                    numTags.push(tempTags);
                });
            }
            //======================
            let wrongTags = [];
            numTags.forEach((id, index) => {
                const tempWrongTags = [];
                const curId = idArr[index] - 1;
                id.forEach((tag) => {
                    if (typeof this.instance.instances[curId].instance.readBuffer[tag - 1] === 'undefined') {
                        tempWrongTags.push(tag);
                    }
                });
                wrongTags.push(tempWrongTags);
            });
            if (!wrongTags.every((id) => id.length === 0)) {
                throw new errors_1.BadRequestError(`Not all tags ${JSON.stringify(wrongTags)} exist in params definitions`);
            }
            return { idArr, numTags };
        };
    }
}
exports.UA_Controller = UA_Controller;

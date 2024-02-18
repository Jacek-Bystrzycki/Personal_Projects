"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyParams = void 0;
const errors_1 = require("../../../types/server/errors");
const verifyParams = (req, instance) => {
    const { id } = req.params;
    const { tags } = req.query;
    let idArr = [];
    if (id) {
        idArr = id.split(',').map((id) => parseInt(id, 10));
        if (!idArr.every((id) => !isNaN(id)))
            throw new errors_1.BadRequestError("'Ids' needs to be a number");
        idArr.forEach((id) => {
            if (!instance.instances[id - 1])
                throw new errors_1.BadRequestError(`Instance ${id} not exists`);
        });
    }
    else {
        for (let i = 0; i < instance.instances.length; i++)
            idArr.push(i + 1);
    }
    //======================
    const queryExists = Object.keys(req.query).length > 0;
    let numTags = [];
    if (queryExists) {
        if (typeof tags !== 'string')
            throw new errors_1.BadRequestError("'tags' missing in query");
        try {
            {
                const tempTags = tags.split(';').map((item) => {
                    return JSON.parse(item);
                });
                numTags = tempTags;
            }
        }
        catch (error) {
            throw new errors_1.BadRequestError('Tags needs to ba array of numbers');
        }
        if (numTags.length !== idArr.length)
            throw new errors_1.BadRequestError('Wrong amount of tags');
    }
    else {
        idArr.forEach((id) => {
            const tempTags = [];
            for (let i = 0; i < instance.instances[id - 1].instance.readBufferConsistent.length; i++) {
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
            if (typeof instance.instances[curId].instance.readBufferConsistent[tag - 1] === 'undefined') {
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
exports.verifyParams = verifyParams;

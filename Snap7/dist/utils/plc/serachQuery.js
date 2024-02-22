"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQueueForErrorMsg = exports.searchQueueForError = exports.searchQueueForDone = void 0;
const searchQueueForDone = (id, queue) => {
    const findQuery = queue.find((query) => query.queryId === id);
    return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.isDone) === true;
};
exports.searchQueueForDone = searchQueueForDone;
const searchQueueForError = (id, queue) => {
    const findQuery = queue.find((query) => query.queryId === id);
    return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.isError) === true;
};
exports.searchQueueForError = searchQueueForError;
const searchQueueForErrorMsg = (id, queue) => {
    const findQuery = queue.find((query) => query.queryId === id);
    return (findQuery === null || findQuery === void 0 ? void 0 : findQuery.status) || 'No message';
};
exports.searchQueueForErrorMsg = searchQueueForErrorMsg;

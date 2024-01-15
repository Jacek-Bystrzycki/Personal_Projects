"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateAsString = void 0;
const getDateAsString = () => {
    const currentHour = new Date().getHours().toString();
    let currentMinutesNumber = new Date().getMinutes();
    let currentMinutes;
    if (currentMinutesNumber < 10) {
        currentMinutes = '0' + currentMinutesNumber.toString();
    }
    else {
        currentMinutes = currentMinutesNumber.toString();
    }
    const currentSecondsNumber = new Date().getSeconds();
    let currentSecond;
    if (currentSecondsNumber < 10) {
        currentSecond = '0' + currentSecondsNumber.toString();
    }
    else {
        currentSecond = currentSecondsNumber.toString();
    }
    return `[${currentHour}:${currentMinutes}:${currentSecond}]: `;
};
exports.getDateAsString = getDateAsString;

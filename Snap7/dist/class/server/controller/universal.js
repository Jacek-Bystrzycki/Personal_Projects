"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universal_Controller = void 0;
const s7_formatData_1 = require("./s7-formatData");
const mb_formatData_1 = require("./mb-formatData");
class Universal_Controller {
    constructor(devices) {
        this.devices = devices;
        this.readAll = (req, res, next) => {
            try {
                //================== S7 ===================
                if (this.devices.s7_definitions) {
                    const s7_ids = this.devices.s7_definitions.instances.map((instance) => {
                        return instance.id;
                    });
                    const s7_tags = this.devices.s7_definitions.instances.map((instance) => {
                        return instance.instance.readBufferConsistent.map((tag) => {
                            return tag.id;
                        });
                    });
                    const s7_tagsBefore = this.devices.s7_definitions.s7_readData(s7_ids, s7_tags);
                    const s7_tagAfter = (0, s7_formatData_1.s7_formatReadData)(s7_tagsBefore);
                    res.s7Tags = s7_tagAfter;
                }
                //================== MB ===================
                if (this.devices.mb_definitions) {
                    const mb_ids = this.devices.mb_definitions.instances.map((instance) => {
                        return instance.id;
                    });
                    const mb_tags = this.devices.mb_definitions.instances.map((instance) => {
                        return instance.instance.readBufferConsistent.map((tag) => {
                            return tag.id;
                        });
                    });
                    const mb_tagsBefore = this.devices.mb_definitions.mb_readFromDevice(mb_ids, mb_tags);
                    const mb_tagAfter = (0, mb_formatData_1.mb_formatReadData)(mb_tagsBefore);
                    res.mbTags = mb_tagAfter;
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.Universal_Controller = Universal_Controller;

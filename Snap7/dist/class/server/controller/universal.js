"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universal_Controller = void 0;
const formatData_1 = require("./formatData");
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
                    const s7_tagAfter = (0, formatData_1.s7_formatReadData)(s7_tagsBefore);
                    res.s7Tags = s7_tagAfter;
                }
                //================== MB ===================
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.Universal_Controller = Universal_Controller;
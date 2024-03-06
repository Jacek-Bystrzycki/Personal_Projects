"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UA_CreateConnections = void 0;
const connect_to_device_1 = require("./connect-to-device");
class UA_CreateConnections {
    constructor(uaDefinitions) {
        this.uaDefinitions = uaDefinitions;
        this.createConnections = () => {
            const instances = this.uaDefinitions.map((item) => {
                return new connect_to_device_1.UA_ConnectToDevice(...item);
            });
            return instances.map((instance, index) => {
                return { id: index + 1, instance };
            });
        };
        this._instances = this.createConnections();
    }
    get instances() {
        return this._instances;
    }
}
exports.UA_CreateConnections = UA_CreateConnections;

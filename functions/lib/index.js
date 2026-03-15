"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAuditLogs = exports.recordMovement = exports.reserveStock = exports.completeProductionOrder = exports.reportConsumption = exports.createProductionOrder = exports.createOrder = exports.convertQuotationToOrder = exports.approveQuotation = exports.createQuotation = exports.ensureAdminClaim = exports.createEmployee = exports.setUserRole = exports.getActivePricingParameters = exports.calculatePrice = void 0;
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
var callable_1 = require("./pricing/callable");
Object.defineProperty(exports, "calculatePrice", { enumerable: true, get: function () { return callable_1.calculatePrice; } });
Object.defineProperty(exports, "getActivePricingParameters", { enumerable: true, get: function () { return callable_1.getActivePricingParameters; } });
var callable_2 = require("./auth/callable");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return callable_2.setUserRole; } });
Object.defineProperty(exports, "createEmployee", { enumerable: true, get: function () { return callable_2.createEmployee; } });
Object.defineProperty(exports, "ensureAdminClaim", { enumerable: true, get: function () { return callable_2.ensureAdminClaim; } });
var callable_3 = require("./quotations/callable");
Object.defineProperty(exports, "createQuotation", { enumerable: true, get: function () { return callable_3.createQuotation; } });
Object.defineProperty(exports, "approveQuotation", { enumerable: true, get: function () { return callable_3.approveQuotation; } });
var callable_4 = require("./orders/callable");
Object.defineProperty(exports, "convertQuotationToOrder", { enumerable: true, get: function () { return callable_4.convertQuotationToOrder; } });
Object.defineProperty(exports, "createOrder", { enumerable: true, get: function () { return callable_4.createOrder; } });
var callable_5 = require("./production/callable");
Object.defineProperty(exports, "createProductionOrder", { enumerable: true, get: function () { return callable_5.createProductionOrder; } });
Object.defineProperty(exports, "reportConsumption", { enumerable: true, get: function () { return callable_5.reportConsumption; } });
Object.defineProperty(exports, "completeProductionOrder", { enumerable: true, get: function () { return callable_5.completeProductionOrder; } });
var callable_6 = require("./inventory/callable");
Object.defineProperty(exports, "reserveStock", { enumerable: true, get: function () { return callable_6.reserveStock; } });
Object.defineProperty(exports, "recordMovement", { enumerable: true, get: function () { return callable_6.recordMovement; } });
var callable_7 = require("./audit/callable");
Object.defineProperty(exports, "queryAuditLogs", { enumerable: true, get: function () { return callable_7.queryAuditLogs; } });
//# sourceMappingURL=index.js.map
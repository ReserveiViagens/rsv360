"use strict";
// Barrel exports for @rsv360/shared
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Types
__exportStar(require("./types/index.js"), exports);
__exportStar(require("./types/tenant.js"), exports);
__exportStar(require("./auth/session.js"), exports);
__exportStar(require("./tenant/routing.js"), exports);
// Validators
__exportStar(require("./validators/checkout.validator.js"), exports);
__exportStar(require("./validators/booking.validator.js"), exports);
// Constants
__exportStar(require("./constants/index.js"), exports);
// Utils
__exportStar(require("./utils/index.js"), exports);
// Drizzle schemas (Fase 1 migração)
__exportStar(require("./schema.js"), exports);
// Fase 1 API types & paths
__exportStar(require("./fase1-api.js"), exports);
// Cotação interativa v2 — contrato Hub / comparativo_cache
__exportStar(require("./cotacao/oferta-normalizada.js"), exports);
__exportStar(require("./cotacao/kit-capacidade.js"), exports);
__exportStar(require("./cotacao/buscar-por-relevancia.js"), exports);
__exportStar(require("./cotacao/intencao-acomodacao.js"), exports);
__exportStar(require("./cotacao/acomodacao-config-label.js"), exports);
__exportStar(require("./cotacao/entrada-contextual.js"), exports);

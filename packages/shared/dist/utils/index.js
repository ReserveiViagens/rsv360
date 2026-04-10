"use strict";
/**
 * Utility functions for RSV360
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSlug = buildSlug;
exports.formatCurrency = formatCurrency;
exports.formatCPF = formatCPF;
exports.formatPhone = formatPhone;
exports.calculateDiscount = calculateDiscount;
function buildSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single
}
function formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
    }).format(amount);
}
function formatCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11)
        return cpf;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        // Mobile with 9th digit
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    else if (cleaned.length === 10) {
        // Landline
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}
function calculateDiscount(items, paymentMethod) {
    let discount = 0;
    // Combo discounts
    if (items >= 4)
        discount = Math.max(discount, 0.15);
    else if (items >= 3)
        discount = Math.max(discount, 0.10);
    else if (items >= 2)
        discount = Math.max(discount, 0.05);
    // Payment method discount
    if (paymentMethod === 'PIX')
        discount = Math.max(discount, 0.05);
    return discount;
}

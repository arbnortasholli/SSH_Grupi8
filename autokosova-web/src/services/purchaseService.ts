import type { PurchaseOrderRequest, PurchaseOrderResponse } from '../lib/types';

const formatEuro = (value: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

const formatPaymentMethod = (order: PurchaseOrderRequest) => {
    if (order.paymentMethod === 'CashOnDelivery') {
        return 'Cash on delivery';
    }

    return order.cardLastFour ? `Card ending in ${order.cardLastFour}` : 'Card';
};

const buildReceiptText = (orderNumber: string, createdAt: string, order: PurchaseOrderRequest) => [
    'AutoKosova purchase receipt',
    '',
    `Order number: ${orderNumber}`,
    `Date: ${new Date(createdAt).toLocaleString()}`,
    '',
    'Car',
    `- ${order.carTitle}`,
    `- Listing ID: ${order.carId}`,
    `- Total: ${formatEuro(order.carPrice)}`,
    '',
    'Customer',
    `- Name: ${order.customerName}`,
    `- Email: ${order.customerEmail}`,
    `- Phone: ${order.customerPhone}`,
    '',
    'Delivery',
    `- Address: ${order.deliveryAddress}`,
    `- City: ${order.deliveryCity}`,
    '',
    'Payment',
    `- Method: ${formatPaymentMethod(order)}`,
    '',
    'Thank you for ordering with AutoKosova.',
].join('\n');

export const purchaseService = {
    createPurchaseOrder: async (order: PurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
        const createdAt = new Date().toISOString();
        const orderNumber = `AK-${Date.now()}`;

        return {
            orderNumber,
            createdAt,
            message: 'Order placed successfully.',
            receiptText: buildReceiptText(orderNumber, createdAt, order),
        };
    },
};

exports.sendBill = async (order) => {
    // In a real application, use nodemailer or SendGrid here.
    // console.log(`[Email Service] Sending bill to ${order.customerEmail} for Order ${order.orderNumber}`);
    
    if (!order.customerEmail) return;

    // Simulate async email sending
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`[Email Service] Successfully sent bill to ${order.customerEmail}`);
            resolve(true);
        }, 500);
    });
};

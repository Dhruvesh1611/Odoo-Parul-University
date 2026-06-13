// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken); // All order actions require login

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/pay', orderController.payOrder);
// Email Receipt Route
router.post('/:id/email', require('../controllers/email.controller').sendOrderReceipt);

module.exports = router;

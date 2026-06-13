const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

// Public/POS endpoints: Read/Validate
router.get('/', couponController.getCoupons);
router.get('/validate/:code', couponController.validateCoupon);

// Admin-only endpoints: Create, Update, Delete
router.post('/', requireRole(['ADMIN']), couponController.createCoupon);
router.put('/:id/toggle', requireRole(['ADMIN']), couponController.toggleCoupon);
router.delete('/:id', requireRole(['ADMIN']), couponController.deleteCoupon);

module.exports = router;

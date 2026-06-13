const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchen.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Protect execution: Only KITCHEN or ADMIN role should access
router.use(authenticateToken); 

router.get('/active', requireRole(['KITCHEN', 'ADMIN']), kitchenController.getActiveKitchenOrders);
router.put('/:id/status', requireRole(['KITCHEN', 'ADMIN']), kitchenController.updateKitchenStatus);

module.exports = router;

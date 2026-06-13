// backend/src/routes/floor.routes.js
const express = require('express');
const router = express.Router();
const floorController = require('../controllers/floor.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Floors
router.get('/floors', authenticateToken, floorController.getFloors);
router.post('/floors', authenticateToken, requireRole(['ADMIN']), floorController.createFloor);

// Tables
router.post('/floors/:id/tables', authenticateToken, requireRole(['ADMIN']), floorController.addTable);
router.put('/tables/:id', authenticateToken, requireRole(['ADMIN']), floorController.updateTable);
router.delete('/tables/:id', authenticateToken, requireRole(['ADMIN']), floorController.deleteTable);

module.exports = router;

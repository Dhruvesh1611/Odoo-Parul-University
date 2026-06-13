// backend/src/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Routes
router.post('/open', authenticateToken, sessionController.openSession);
router.put('/:id/close', authenticateToken, sessionController.closeSession);
router.get('/active', authenticateToken, sessionController.getActiveSession);
router.get('/:id', authenticateToken, sessionController.getSession);

module.exports = router;

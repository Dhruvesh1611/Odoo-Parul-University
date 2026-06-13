const express = require('express');
const router = express.Router();
const terminalController = require('../controllers/terminal.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, terminalController.getTerminals);
router.post('/', authenticateToken, requireRole(['ADMIN']), terminalController.createTerminal);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), terminalController.deleteTerminal);

module.exports = router;

const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', verifyToken, getTasks);
router.get('/:id', verifyToken, getTaskById);
router.post('/', verifyToken, isAdmin, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, isAdmin, deleteTask);

module.exports = router;

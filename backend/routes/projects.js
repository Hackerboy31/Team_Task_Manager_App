const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const router = express.Router();

router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProjectById);
router.post('/', verifyToken, isAdmin, createProject);
router.put('/:id', verifyToken, isAdmin, updateProject);
router.delete('/:id', verifyToken, isAdmin, deleteProject);

module.exports = router;

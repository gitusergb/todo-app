const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { validateTaskCreation, validateTaskUpdate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', getTask);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', validateTaskCreation, createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', validateTaskUpdate, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch('/:id/toggle', toggleTaskCompletion);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getDashboardStats,
  getAllTasks,
  deleteAnyTask,
  updateAnyTask
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:userId
// @desc    Get user by ID with task statistics
// @access  Private (Admin only)
router.get('/users/:userId', getUserById);

// @route   PUT /api/admin/users/:userId
// @desc    Update user information
// @access  Private (Admin only)
router.put('/users/:userId', validateUserUpdate, updateUser);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user and associated tasks
// @access  Private (Admin only)
router.delete('/users/:userId', deleteUser);

// @route   PATCH /api/admin/users/:userId/toggle-status
// @desc    Toggle user active/inactive status
// @access  Private (Admin only)
router.patch('/users/:userId/toggle-status', toggleUserStatus);

// @route   GET /api/admin/tasks
// @desc    Get all tasks with pagination and filtering
// @access  Private (Admin only)
router.get('/tasks', getAllTasks);

// @route   PUT /api/admin/tasks/:taskId
// @desc    Update any task
// @access  Private (Admin only)
router.put('/tasks/:taskId', updateAnyTask);

// @route   DELETE /api/admin/tasks/:taskId
// @desc    Delete any task
// @access  Private (Admin only)
router.delete('/tasks/:taskId', deleteAnyTask);

module.exports = router;

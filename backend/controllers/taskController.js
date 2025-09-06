const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// Get all tasks for a user (users see only their tasks, admins see all tasks)
const getTasks = async (req, res) => {
  try {
    const { completed, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter - regular users only see their tasks, admins see all
    const filter = userRole === 'admin' ? {} : { userId };
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) {
      filter.priority = priority;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .sort(sort)
      .populate('createdBy', 'username firstName lastName')
      .populate('userId', 'username firstName lastName email');

    res.json({
      tasks,
      count: tasks.length,
      isAdmin: userRole === 'admin'
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// Get single task (users can only access their own tasks, admins can access any task)
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter based on user role
    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const task = await Task.findOne(filter)
      .populate('createdBy', 'username firstName lastName')
      .populate('userId', 'username firstName lastName email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, dueDate } = req.body;
    const userId = req.user._id;

    const task = new Task({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
      createdBy: userId
    });

    await task.save();
    await task.populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// Update task (users can only update their own tasks, admins can update any task)
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.createdBy;
    delete updates._id;

    // Convert dueDate if provided
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    // Build filter based on user role
    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const task = await Task.findOneAndUpdate(
      filter,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName')
     .populate('userId', 'username firstName lastName email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// Delete task (users can only delete their own tasks, admins can delete any task)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter based on user role
    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// Toggle task completion (users can only toggle their own tasks, admins can toggle any task)
const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter based on user role
    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const task = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    task.completed = !task.completed;
    await task.save();
    await task.populate('createdBy', 'username firstName lastName');
    await task.populate('userId', 'username firstName lastName email');

    res.json({
      message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`,
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
};

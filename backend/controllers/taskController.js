const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, project, assignedTo } = req.body;

    if (!title || !project || !assignedTo) {
      return res.status(400).json({ message: 'Title, project, and assignedTo are required' });
    }

    if (!mongoose.isValidObjectId(project)) {
      return res.status(400).json({ message: 'Project ID must be a valid MongoDB ObjectId' });
    }

    if (!mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: 'AssignedTo must be a valid MongoDB ObjectId' });
    }

    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Pending',
      dueDate,
      project,
      assignedTo,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status, sort } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;

    if (req.user.role === 'Admin') {
      if (assignedTo) {
        filter.assignedTo = assignedTo;
      }
    } else {
      filter.assignedTo = req.user._id;
    }

    let query = Task.find(filter)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role');

    if (sort === 'dueDateAsc') {
      query = query.sort({ dueDate: 1 });
    } else if (sort === 'dueDateDesc') {
      query = query.sort({ dueDate: -1 });
    }

    const tasks = await query;
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'Admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied to update this task' });
    }

    const { title, description, status, dueDate, project, assignedTo } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (project !== undefined) task.project = project;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    const updated = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role');
    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.remove();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

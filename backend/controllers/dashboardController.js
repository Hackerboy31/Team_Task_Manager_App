const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardMetrics = async (req, res) => {
  try {
    const taskFilter = req.user.role === 'Admin' ? {} : { assignedTo: req.user._id };
    const projectFilter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'In-Progress' });
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Completed' },
    });

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard metrics' });
  }
};

module.exports = { getDashboardMetrics };

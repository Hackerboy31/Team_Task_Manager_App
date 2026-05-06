const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const validMembers = members ? await User.find({ _id: { $in: members } }).select('_id') : [];
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: validMembers.map((member) => member._id),
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
};

const getProjects = async (req, res) => {
  try {
    const query = req.user.role === 'Admin'
      ? {}
      : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (req.user.role !== 'Admin') {
      const isMember = project.members.some((member) => member._id.equals(req.user._id));
      const isCreator = project.createdBy?._id.equals(req.user._id);
      if (!isMember && !isCreator) {
        return res.status(403).json({ message: 'Access denied to this project' });
      }
    }
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) {
      const validMembers = await User.find({ _id: { $in: members } }).select('_id');
      project.members = validMembers.map((member) => member._id);
    }

    await project.save();
    const updated = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.remove();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};

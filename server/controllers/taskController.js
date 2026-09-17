const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { calculateTaskPriority } = require('../services/priorityEngineService');
const { recordAuditLog } = require('../services/auditLogService');

// @desc    Get all tasks with filters & priority calculations
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { priority, status, category, search, assignedTo } = req.query;
    const filter = {};

    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('relatedCompanyId', 'name')
      .populate('relatedLeadId', 'leadId contactPerson')
      .populate('relatedOpportunityId', 'name')
      .sort({ dueDate: 1 });

    const prioritizedTasks = tasks.map((t) => {
      const p = calculateTaskPriority(t);
      return {
        ...t.toObject(),
        calculatedPriority: p.calculatedPriority,
        priorityColor: p.color,
      };
    });

    res.json({ success: true, count: prioritizedTasks.length, tasks: prioritizedTasks });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('relatedCompanyId', 'name')
      .populate('relatedLeadId', 'leadId contactPerson')
      .populate('relatedOpportunityId', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const p = calculateTaskPriority(task);
    res.json({
      success: true,
      task: {
        ...task.toObject(),
        calculatedPriority: p.calculatedPriority,
        priorityColor: p.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, dueDate, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required' });
    }

    const assignedUserId = assignedTo || req.user._id;

    const task = await Task.create({
      ...req.body,
      assignedTo: assignedUserId,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('relatedCompanyId', 'name');

    // Create notification for assigned user if assigned to someone else
    if (assignedUserId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: assignedUserId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}"`,
        type: 'TaskDue',
        relatedEntity: { entityType: 'Task', entityId: task._id },
      });
    }

    // Record audit log
    await recordAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      entityType: 'Task',
      entityId: task._id,
      changes: [{ field: 'title', newValue: title }],
    });

    const p = calculateTaskPriority(populatedTask);

    res.status(201).json({
      success: true,
      task: {
        ...populatedTask.toObject(),
        calculatedPriority: p.calculatedPriority,
        priorityColor: p.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('relatedCompanyId', 'name');

    // Audit log
    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE',
      entityType: 'Task',
      entityId: task._id,
      changes: [{ field: 'title', oldValue: task.title, newValue: updatedTask.title }],
    });

    const p = calculateTaskPriority(updatedTask);

    res.json({
      success: true,
      task: {
        ...updatedTask.toObject(),
        calculatedPriority: p.calculatedPriority,
        priorityColor: p.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task status (e.g. TODO, IN_PROGRESS, COMPLETED, CANCELLED)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    if (status === 'COMPLETED' || status === 'Completed') {
      task.completedAt = new Date();
    }
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('relatedCompanyId', 'name');

    // Record Audit Log
    await recordAuditLog({
      userId: req.user._id,
      action: 'STATUS_CHANGE',
      entityType: 'Task',
      entityId: task._id,
      changes: [{ field: 'status', oldValue: oldStatus, newValue: status }],
    });

    const p = calculateTaskPriority(populatedTask);

    res.json({
      success: true,
      task: {
        ...populatedTask.toObject(),
        calculatedPriority: p.calculatedPriority,
        priorityColor: p.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    await recordAuditLog({
      userId: req.user._id,
      action: 'DELETE',
      entityType: 'Task',
      entityId: req.params.id,
      changes: [{ field: 'title', oldValue: task.title }],
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};

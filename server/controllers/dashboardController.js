const Task = require('../models/Task');
const Lead = require('../models/Lead');
const CEOUpdate = require('../models/CEOUpdate');
const Opportunity = require('../models/Opportunity');
const SalesActivity = require('../models/SalesActivity');
const { calculateDeadlineUrgency } = require('../services/deadlineEngineService');
const { calculateTaskPriority } = require('../services/priorityEngineService');

// @desc    Get Action Center consolidated items
// @route   GET /api/dashboard/action-center
// @access  Private
const getActionCenter = async (req, res, next) => {
  try {
    const today = new Date();

    // 1. Critical & Overdue Tasks
    const tasks = await Task.find({ status: { $ne: 'Completed' } })
      .populate('assignedTo', 'name')
      .populate('relatedCompanyId', 'name');

    const prioritizedTasks = tasks.map((t) => {
      const p = calculateTaskPriority(t);
      const urgency = calculateDeadlineUrgency(t.dueDate);
      return {
        id: t._id,
        type: 'Task',
        title: t.title,
        subtitle: t.relatedCompanyId ? t.relatedCompanyId.name : 'General Task',
        priority: p.calculatedPriority,
        color: p.color,
        urgency: urgency.label,
        action: 'Update Task',
        link: '/tasks',
        dueDate: t.dueDate,
      };
    }).filter((t) => t.priority === 'Critical' || t.priority === 'High');

    // 2. Pending CEO Updates
    const ceoUpdates = await CEOUpdate.find({ status: 'Pending' })
      .populate('relatedCompanyId', 'name')
      .limit(5);

    const ceoItems = ceoUpdates.map((c) => ({
      id: c._id,
      type: 'CEO Update',
      title: c.title,
      subtitle: c.relatedCompanyId ? c.relatedCompanyId.name : 'Important Activity',
      priority: c.importance === 'Critical' ? 'Critical' : 'High',
      color: 'orange',
      urgency: 'Action Required',
      action: 'Inform CEO',
      link: '/ceo-updates',
    }));

    // 3. Expiring / Due Today Opportunities
    const opps = await Opportunity.find({ status: 'Active' });
    const oppItems = opps.map((o) => {
      const urgency = calculateDeadlineUrgency(o.endDate);
      return {
        id: o._id,
        type: 'Opportunity',
        title: o.name,
        subtitle: `${o.type} - ${o.organization}`,
        priority: urgency.status === 'Red' ? 'Critical' : urgency.status === 'Orange' ? 'High' : 'Medium',
        color: urgency.status === 'Red' ? 'red' : urgency.status === 'Orange' ? 'orange' : 'green',
        urgency: urgency.label,
        action: 'View Opportunity',
        link: '/opportunities',
      };
    }).filter((o) => o.color === 'red' || o.color === 'orange');

    const actionCenterItems = [...prioritizedTasks, ...ceoItems, ...oppItems];

    res.json({
      success: true,
      count: actionCenterItems.length,
      items: actionCenterItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Dashboard summary card counts
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const activeFunnel = await SalesActivity.countDocuments({ status: { $ne: 'Completed' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUpsDueToday = await SalesActivity.countDocuments({
      nextActionDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    const overdueFollowUps = await SalesActivity.countDocuments({
      nextActionDate: { $lt: today },
      status: { $ne: 'Completed' },
    });

    const pendingTasks = await Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });
    const ceoUpdatesPending = await CEOUpdate.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        activeFunnel,
        followUpsDueToday,
        overdueFollowUps,
        pendingTasks,
        ceoUpdatesPending,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActionCenter, getDashboardStats };

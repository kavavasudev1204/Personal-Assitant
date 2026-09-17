const { calculateDeadlineUrgency } = require('./deadlineEngineService');

/**
 * Prioritization Engine
 * Combines:
 * - Manual priority (Critical, High, Medium, Low)
 * - Due date urgency
 * - Task status (Overdue)
 * - CEO involvement (informCEO == true)
 */
function calculateTaskPriority(task) {
  const urgency = calculateDeadlineUrgency(task.dueDate);

  if (task.status === 'Overdue' || urgency.status === 'Red' || task.priority === 'Critical') {
    return { calculatedPriority: 'Critical', color: 'red', rank: 1 };
  }

  if (task.informCEO || task.priority === 'High' || urgency.status === 'Orange') {
    return { calculatedPriority: 'High', color: 'orange', rank: 2 };
  }

  if (task.priority === 'Medium' || urgency.status === 'Green') {
    return { calculatedPriority: 'Medium', color: 'green', rank: 3 };
  }

  return { calculatedPriority: 'Low', color: 'gray', rank: 4 };
}

module.exports = { calculateTaskPriority };

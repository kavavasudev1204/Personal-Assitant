/**
 * Timezone-safe Deadline Urgency Calculator
 * Rules:
 * > 7 days remaining       -> Green
 * 1 to 7 days remaining     -> Orange
 * 0 days remaining (Today)  -> Red
 * < 0 days remaining        -> Grey (Expired)
 */

function calculateDeadlineUrgency(targetDateStrOrObj) {
  if (!targetDateStrOrObj) {
    return { status: 'Grey', label: 'No Deadline', daysRemaining: 0 };
  }

  const targetDate = new Date(targetDateStrOrObj);
  const now = new Date();

  // Normalize both dates to midnight UTC to prevent timezone skew
  const targetMidnight = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const nowMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round((targetMidnight - nowMidnight) / msPerDay);

  if (daysRemaining > 7) {
    return { status: 'Green', label: 'Safe', daysRemaining, colorCode: '#10B981' };
  } else if (daysRemaining >= 1 && daysRemaining <= 7) {
    return { status: 'Orange', label: `Due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`, daysRemaining, colorCode: '#F59E0B' };
  } else if (daysRemaining === 0) {
    return { status: 'Red', label: 'Due Today', daysRemaining: 0, colorCode: '#EF4444' };
  } else {
    return { status: 'Grey', label: `Expired (${Math.abs(daysRemaining)} days ago)`, daysRemaining, colorCode: '#6B7280' };
  }
}

module.exports = { calculateDeadlineUrgency };

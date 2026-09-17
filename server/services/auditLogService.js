const AuditLog = require('../models/AuditLog');

async function recordAuditLog({ userId, action, entityType, entityId, changes }) {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      changes: changes || [],
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
}

module.exports = { recordAuditLog };

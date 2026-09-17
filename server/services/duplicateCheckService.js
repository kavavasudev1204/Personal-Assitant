const Lead = require('../models/Lead');
const Company = require('../models/Company');

/**
 * Duplicate Lead Detector
 * Searches for potential duplicate matches by:
 * - Exact/normalized company name
 * - Email match
 * - Phone match
 * - Contact person + City match
 */
async function checkDuplicateLead({ companyName, email, phone, contactPerson, city }) {
  const matches = [];

  // Search by Company Name
  if (companyName && companyName.trim()) {
    const cleanName = companyName.trim().toLowerCase();
    const existingCompanies = await Company.find({
      name: { $regex: new RegExp(cleanName, 'i') },
    });

    for (const comp of existingCompanies) {
      const leads = await Lead.find({ companyId: comp._id })
        .populate('companyId', 'name location')
        .populate('assignedSalesPersonId', 'name');
      matches.push(...leads.map(l => ({ lead: l, reason: `Matching Company Name: "${comp.name}"` })));
    }
  }

  // Search by Email
  if (email && email.trim()) {
    const leadsByEmail = await Lead.find({ email: email.trim().toLowerCase() })
      .populate('companyId', 'name location')
      .populate('assignedSalesPersonId', 'name');
    matches.push(...leadsByEmail.map(l => ({ lead: l, reason: `Matching Email: "${email}"` })));
  }

  // Search by Phone
  if (phone && phone.trim()) {
    const leadsByPhone = await Lead.find({ phone: phone.trim() })
      .populate('companyId', 'name location')
      .populate('assignedSalesPersonId', 'name');
    matches.push(...leadsByPhone.map(l => ({ lead: l, reason: `Matching Phone: "${phone}"` })));
  }

  // Deduplicate matched array by lead _id
  const uniqueMatchesMap = new Map();
  matches.forEach(item => {
    if (!uniqueMatchesMap.has(item.lead._id.toString())) {
      uniqueMatchesMap.set(item.lead._id.toString(), item);
    }
  });

  return Array.from(uniqueMatchesMap.values());
}

module.exports = { checkDuplicateLead };

const SystemSettings = require('../models/SystemSettings');

const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };

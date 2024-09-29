const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  subject: String,
  message: String,
  patients: [String],
  status: String,
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailLog', emailLogSchema);

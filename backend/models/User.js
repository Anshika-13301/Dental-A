const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'PRACTICE_ADMIN', 'STAFF_USER', 'admin', 'patient'], 
    default: 'PRACTICE_ADMIN' 
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
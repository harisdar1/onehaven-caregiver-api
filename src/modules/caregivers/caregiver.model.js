const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: [true, 'Supabase ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

const Caregiver = mongoose.model('Caregiver', caregiverSchema);

module.exports = Caregiver;

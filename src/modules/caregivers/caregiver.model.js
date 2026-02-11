const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const caregiverSchema = new mongoose.Schema({
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
  },
  passkey: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash password before saving
caregiverSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('passkey')) return next();

  const salt = await bcrypt.genSalt(10);
  this.passkey = await bcrypt.hash(this.passkey, salt);
  next();
});

// Method to compare passwords during login
caregiverSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passkey);
};

// Remove passkey from JSON responses
caregiverSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passkey;
  return obj;
};

const Caregiver = mongoose.model('Caregiver', caregiverSchema);

module.exports = Caregiver;

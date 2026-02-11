const mongoose = require('mongoose');

const protectedMemberSchema = new mongoose.Schema({
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    required: [true, 'Caregiver ID is required']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    trim: true
    // e.g., "Son", "Daughter", "Parent", "Spouse"
  },
  birthYear: {
    type: Number,
    required: [true, 'Birth year is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster queries by caregiverId
protectedMemberSchema.index({ caregiverId: 1 });

const ProtectedMember = mongoose.model('ProtectedMember', protectedMemberSchema);

module.exports = ProtectedMember;

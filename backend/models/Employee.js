import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Operations']
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    validate: {
      validator: function(value) {
        // Joining date should not be in the future
        return value <= new Date();
      },
      message: 'Joining date cannot be in the future'
    }
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'manager'],
    default: 'employee'
  },
  // Annual leave balance (in days)
  leaveBalance: {
    type: Number,
    default: 20,
    min: [0, 'Leave balance cannot be negative']
  },
  // Track when leave balance was last updated
  lastBalanceUpdate: {
    type: Date,
    default: Date.now
  },
  // Employee status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to calculate available leave days
employeeSchema.methods.getAvailableLeaves = function() {
  // Calculate tenure in months
  const now = new Date();
  const joining = new Date(this.joiningDate);
  const monthsWorked = (now.getFullYear() - joining.getFullYear()) * 12 + (now.getMonth() - joining.getMonth());
  
  // For demo: 1.67 leaves per month worked (20 leaves per year)
  const earnedLeaves = Math.floor(monthsWorked * 1.67);
  return Math.min(earnedLeaves, 20); // Cap at 20 days per year
};

export default mongoose.model('Employee', employeeSchema);
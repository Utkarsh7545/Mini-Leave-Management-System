import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: ['sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Who reviewed the request
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reviewedAt: {
    type: Date
  },
  reviewComment: {
    type: String,
    maxlength: [200, 'Review comment cannot exceed 200 characters']
  },
  // Number of working days (excluding weekends)
  totalDays: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Calculate working days between start and end date (excluding weekends)
leaveRequestSchema.methods.calculateWorkingDays = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  let workingDays = 0;
  
  // Loop through each day
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // If it's not Saturday (6) or Sunday (0), count it as working day
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Pre-save middleware to calculate total days
leaveRequestSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    this.totalDays = this.calculateWorkingDays();
  }
  next();
});

// Static method to check for overlapping leaves
leaveRequestSchema.statics.hasOverlappingLeave = async function(employeeId, startDate, endDate, excludeRequestId = null) {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] }, // Don't consider rejected leaves
    $or: [
      // New leave starts during existing leave
      { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
      // New leave ends during existing leave
      { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
      // New leave completely encompasses existing leave
      { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
    ]
  };
  
  // Exclude current request when updating
  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }
  
  const overlappingLeave = await this.findOne(query);
  return !!overlappingLeave;
};

export default mongoose.model('LeaveRequest', leaveRequestSchema);